const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

// Repository information
const REPO_OWNER = 'crypiehef';
const REPO_NAME = 'NetControlAPP';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

/**
 * Check for updates from GitHub
 */
exports.checkForUpdates = async (req, res) => {
  try {
    // Get the latest commit from GitHub
    const response = await axios.get(`${GITHUB_API_URL}/commits/main`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NetControlApp'
      }
    });

    const latestCommitSha = response.data.sha;
    const latestCommitMessage = response.data.commit.message;
    const latestCommitDate = response.data.commit.committer.date;
    const latestCommitAuthor = response.data.commit.author.name;

    // Get the current local commit
    const { stdout: currentCommitSha } = await execAsync('git rev-parse HEAD', {
      cwd: '/project'
    });

    const currentSha = currentCommitSha.trim();
    const remoteSha = latestCommitSha.trim();

    // Check if there's an update available
    const updateAvailable = currentSha !== remoteSha;

    // Get current commit info
    let currentCommitInfo = {};
    if (!updateAvailable) {
      try {
        const { stdout: currentMessage } = await execAsync('git log -1 --pretty=%B', {
          cwd: '/project'
        });
        const { stdout: currentDate } = await execAsync('git log -1 --pretty=%ci', {
          cwd: '/project'
        });
        const { stdout: currentAuthor } = await execAsync('git log -1 --pretty=%an', {
          cwd: '/project'
        });
        
        currentCommitInfo = {
          message: currentMessage.trim(),
          date: currentDate.trim(),
          author: currentAuthor.trim()
        };
      } catch (error) {
        console.error('Error getting current commit info:', error);
      }
    }

    res.json({
      updateAvailable,
      current: {
        sha: currentSha,
        ...currentCommitInfo
      },
      latest: {
        sha: remoteSha,
        message: latestCommitMessage,
        date: latestCommitDate,
        author: latestCommitAuthor
      }
    });

  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ 
      error: 'Failed to check for updates',
      details: error.message
    });
  }
};

/**
 * Perform the update
 */
exports.performUpdate = async (req, res) => {
  try {
    const projectRoot = '/project';

    // Set up SSE (Server-Sent Events) for progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (message, progress) => {
      res.write(`data: ${JSON.stringify({ message, progress })}\n\n`);
    };

    sendProgress('Starting update process...', 10);

    // Step 1: Fetch latest changes
    sendProgress('Fetching latest changes from GitHub...', 20);
    await execAsync('git fetch origin main', { cwd: projectRoot });

    // Step 2: Stash any local changes
    sendProgress('Saving local changes...', 30);
    try {
      await execAsync('git stash', { cwd: projectRoot });
    } catch (error) {
      // It's okay if there's nothing to stash
      console.log('No local changes to stash');
    }

    // Step 3: Pull latest changes
    sendProgress('Pulling latest changes...', 40);
    await execAsync('git pull origin main', { cwd: projectRoot });

    // Step 4: Check if we need to rebuild (check for package.json changes)
    sendProgress('Checking for dependency updates...', 50);
    const { stdout: changedFiles } = await execAsync('git diff --name-only HEAD@{1} HEAD', { cwd: projectRoot });
    const needsRebuild = changedFiles.includes('package.json');

    if (needsRebuild) {
      // Step 5a: Install backend dependencies if needed
      const backendPackageChanged = changedFiles.includes('backend/package.json');
      if (backendPackageChanged) {
        sendProgress('Installing backend dependencies...', 60);
        await execAsync('npm install', { cwd: path.join(projectRoot, 'backend') });
      }

      // Step 5b: Install frontend dependencies if needed
      const frontendPackageChanged = changedFiles.includes('frontend/package.json');
      if (frontendPackageChanged) {
        sendProgress('Installing frontend dependencies...', 70);
        await execAsync('npm install', { cwd: path.join(projectRoot, 'frontend') });
      }

      // Step 6: Rebuild Docker containers
      sendProgress('Rebuilding Docker containers...', 80);
      await execAsync('docker-compose build', { cwd: projectRoot });
    } else {
      sendProgress('No rebuild needed, skipping to restart...', 70);
    }

    // Step 7: Restart services
    sendProgress('Restarting services...', 90);
    
    // We'll use a different approach - create a flag file and let a separate process handle the restart
    const restartFlagPath = path.join(projectRoot, '.restart-required');
    fs.writeFileSync(restartFlagPath, new Date().toISOString());

    sendProgress('Update completed! Please refresh your browser with SHIFT+Refresh.', 100);
    
    // Send final message
    res.write(`data: ${JSON.stringify({ 
      message: 'Update completed successfully!', 
      progress: 100,
      completed: true 
    })}\n\n`);
    
    res.end();

    // Schedule a restart after 2 seconds to allow the response to be sent
    setTimeout(async () => {
      try {
        await execAsync('docker-compose restart', { cwd: projectRoot });
      } catch (error) {
        console.error('Error restarting services:', error);
      }
    }, 2000);

  } catch (error) {
    console.error('Error performing update:', error);
    res.write(`data: ${JSON.stringify({ 
      error: 'Update failed',
      message: error.message,
      progress: -1
    })}\n\n`);
    res.end();
  }
};

/**
 * Get current version info
 */
exports.getVersionInfo = async (req, res) => {
  try {
    const projectRoot = '/project';
    
    const { stdout: currentSha } = await execAsync('git rev-parse HEAD', { cwd: projectRoot });
    const { stdout: currentMessage } = await execAsync('git log -1 --pretty=%B', { cwd: projectRoot });
    const { stdout: currentDate } = await execAsync('git log -1 --pretty=%ci', { cwd: projectRoot });
    const { stdout: currentAuthor } = await execAsync('git log -1 --pretty=%an', { cwd: projectRoot });
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectRoot });

    res.json({
      sha: currentSha.trim(),
      message: currentMessage.trim(),
      date: currentDate.trim(),
      author: currentAuthor.trim(),
      branch: branch.trim()
    });

  } catch (error) {
    console.error('Error getting version info:', error);
    res.status(500).json({ 
      error: 'Failed to get version info',
      details: error.message
    });
  }
};

