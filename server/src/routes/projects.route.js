const express = require('express');
const projects = require('../config/projects');
const { getBugStats } = require('../services/bugStatsService');

const router = express.Router();

router.get('/projects/:key/bug-stats', async (req, res, next) => {
  const tabKey = req.params.key.toLowerCase();
  const config = projects[tabKey];

  if (!config || !config.enabled) {
    return res.status(404).json({
      error: {
        code: 'PROJECT_NOT_CONFIGURED',
        message: `La pestaña "${tabKey}" no tiene un proyecto de Jira configurado todavía.`,
      },
    });
  }

  try {
    const displayName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
    const stats = await getBugStats({
      tabKey,
      displayName,
      jiraProjectKey: config.jiraProjectKey,
      bugIssueType: config.bugIssueType,
      hotfixFieldId: config.hotfixFieldId,
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
