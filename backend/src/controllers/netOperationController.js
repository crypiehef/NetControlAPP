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

    if (status) {
      query.status = status;
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

    const updatedNetOperation = await NetOperation.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const { callsign, name, location, license_class, notes } = req.body;

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

