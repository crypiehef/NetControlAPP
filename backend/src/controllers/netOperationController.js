const NetOperation = require('../models/NetOperation');
const Settings = require('../models/Settings');
const qrzService = require('../services/qrzService');
const pdfService = require('../services/pdfService');
const path = require('path');

// @desc    Create new net operation
// @route   POST /api/net-operations
// @access  Private
exports.createNetOperation = async (req, res) => {
  try {
    const { netName, frequency, notes } = req.body;

    const netOperation = await NetOperation.create({
      operatorId: req.user._id,
      operatorCallsign: req.user.callsign,
      netName,
      frequency,
      notes,
      status: 'active'
    });

    res.status(201).json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all net operations
// @route   GET /api/net-operations
// @access  Private
exports.getNetOperations = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status && ['active', 'scheduled', 'completed'].includes(status)) {
      query.status = { $eq: status };
    }

    const netOperations = await NetOperation.find(query)
      .populate('operatorId', 'username callsign')
      .sort({ startTime: -1 });

    res.json(netOperations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single net operation
// @route   GET /api/net-operations/:id
// @access  Private
exports.getNetOperation = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id)
      .populate('operatorId', 'username callsign');

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    res.json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update net operation
// @route   PUT /api/net-operations/:id
// @access  Private
exports.updateNetOperation = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this net operation' });
    }

    // Only allow specific fields to be updated with sanitization
    const allowedUpdates = ['name', 'description', 'frequency', 'notes'];
    const updates = {};
    
    // Sanitize function
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/[<>\"'%;()&+]/g, '').trim();
    };
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = sanitizeString(req.body[key]);
      }
    });

    // Use parameterized query with ObjectId validation
    const updatedNetOperation = await NetOperation.findOneAndUpdate(
      { _id: { $eq: req.params.id } },
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedNetOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add check-in to net operation
// @route   POST /api/net-operations/:id/checkins
// @access  Private
exports.addCheckIn = async (req, res) => {
  try {
    const { callsign, name, location, license_class, stayingForComments, notes } = req.body;

    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to add check-ins to this net operation' });
    }

    netOperation.checkIns.push({
      callsign: callsign.toUpperCase(),
      name,
      location: location || '',
      license_class: license_class || '',
      stayingForComments: stayingForComments || false,
      notes,
      timestamp: new Date()
    });

    await netOperation.save();

    res.status(201).json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Lookup callsign via QRZ
// @route   GET /api/net-operations/lookup/:callsign
// @access  Private
exports.lookupCallsign = async (req, res) => {
  try {
    const { callsign } = req.params;
    
    // Get user's QRZ API key from settings
    const settings = await Settings.findOne({ userId: req.user._id });
    
    if (!settings || !settings.qrzApiKey) {
      return res.status(400).json({ 
        error: 'QRZ API key not configured. Please add your API key in settings.' 
      });
    }

    const result = await qrzService.lookupCallsign(callsign, settings.qrzApiKey);
    
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Callsign not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Complete net operation
// @route   PUT /api/net-operations/:id/complete
// @access  Private
exports.completeNetOperation = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    netOperation.status = 'completed';
    netOperation.endTime = new Date();
    await netOperation.save();

    res.json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Export net operation to PDF
// @route   GET /api/net-operations/:id/pdf
// @access  Private
exports.exportToPDF = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id)
      .populate('operatorId', 'username callsign');

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Get user's logo if available
    const settings = await Settings.findOne({ userId: req.user._id });
    let logoPath = null;
    
    if (settings && settings.logo) {
      logoPath = path.join(__dirname, '../../uploads', path.basename(settings.logo));
    }

    const pdfBuffer = await pdfService.generateNetOperationPDF(netOperation, logoPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=net-operation-${netOperation._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete check-in from net operation
// @route   DELETE /api/net-operations/:id/checkins/:checkinId
// @access  Private
exports.deleteCheckIn = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    netOperation.checkIns = netOperation.checkIns.filter(
      checkIn => checkIn._id.toString() !== req.params.checkinId
    );

    await netOperation.save();

    res.json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete net operation
// @route   DELETE /api/net-operations/:id
// @access  Private
exports.deleteNetOperation = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator or admin
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this net operation' });
    }

    await NetOperation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Net operation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Schedule future net operation(s)
// @route   POST /api/net-operations/schedule
// @access  Private
exports.scheduleNetOperation = async (req, res) => {
  try {
    const { netName, frequency, notes, startTime, recurrence } = req.body;

    const scheduledOps = [];
    const baseDate = new Date(startTime);

    // Create the first scheduled operation
    const firstOp = await NetOperation.create({
      operatorId: req.user._id,
      operatorCallsign: req.user.callsign,
      netName,
      frequency,
      notes,
      startTime: baseDate,
      status: 'scheduled',
      isScheduled: true,
      recurrence: recurrence || 'none'
    });

    scheduledOps.push(firstOp);

    // If recurrence is set, create additional operations (generate for 1 year ahead)
    if (recurrence && recurrence !== 'none') {
      let maxOccurrences;
      
      // Calculate occurrences for approximately 1 year
      switch (recurrence) {
        case 'daily':
          maxOccurrences = 365; // 1 year of daily nets
          break;
        case 'weekly':
          maxOccurrences = 52; // 1 year of weekly nets
          break;
        case 'bi-weekly':
          maxOccurrences = 26; // 1 year of bi-weekly nets
          break;
        case 'monthly':
          maxOccurrences = 12; // 1 year of monthly nets
          break;
        default:
          maxOccurrences = 1;
      }
      
      for (let i = 1; i < maxOccurrences; i++) {
        let nextDate = new Date(baseDate);
        
        switch (recurrence) {
          case 'daily':
            nextDate.setDate(baseDate.getDate() + i);
            break;
          case 'weekly':
            nextDate.setDate(baseDate.getDate() + (i * 7));
            break;
          case 'bi-weekly':
            nextDate.setDate(baseDate.getDate() + (i * 14));
            break;
          case 'monthly':
            nextDate.setMonth(baseDate.getMonth() + i);
            break;
          default:
            break;
        }

        const scheduledOp = await NetOperation.create({
          operatorId: req.user._id,
          operatorCallsign: req.user.callsign,
          netName,
          frequency,
          notes,
          startTime: nextDate,
          status: 'scheduled',
          isScheduled: true,
          recurrence
        });

        scheduledOps.push(scheduledOp);
      }
    }

    res.status(201).json({
      message: `${scheduledOps.length} operation(s) scheduled successfully`,
      operations: scheduledOps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Start a scheduled net operation
// @route   PUT /api/net-operations/:id/start
// @access  Private
exports.startScheduledNet = async (req, res) => {
  try {
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to start this net operation' });
    }

    // Check if it's a scheduled operation
    if (netOperation.status !== 'scheduled') {
      return res.status(400).json({ error: 'This operation is not scheduled' });
    }

    // Update status to active and set current time as start time
    netOperation.status = 'active';
    netOperation.startTime = new Date();
    netOperation.isScheduled = false;
    await netOperation.save();

    res.json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update net operation notes
// @route   PUT /api/net-operations/:id/notes
// @access  Private
exports.updateNetNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator or admin
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this net operation' });
    }

    netOperation.notes = notes || '';
    await netOperation.save();

    res.json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update check-in notes
// @route   PUT /api/net-operations/:id/checkins/:checkinId/notes
// @access  Private
exports.updateCheckInNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const netOperation = await NetOperation.findById(req.params.id);

    if (!netOperation) {
      return res.status(404).json({ error: 'Net operation not found' });
    }

    // Check if user is the operator or admin
    if (netOperation.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this net operation' });
    }

    // Find and update the check-in
    const checkIn = netOperation.checkIns.id(req.params.checkinId);
    
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    checkIn.notes = notes || '';
    await netOperation.save();

    res.json(netOperation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

