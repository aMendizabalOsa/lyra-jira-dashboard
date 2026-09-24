const express = require('express');
const projects = require('../config/projects');
const { getBugStats } = require('../services/bugStatsService');
const { getPlanning } = require('../services/planningService');

const router = express.Router();

function notConfigured(res, tabKey, what) {
  return res.status(404).json({
    error: {
      code: 'PROJECT_NOT_CONFIGURED',
      message: `La pestaña "${tabKey}" no tiene ${what} configurado todavía.`,
    },
  });
}

function displayNameOf(tabKey) {
  return tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
}

router.get('/projects/:key/bug-stats', async (req, res, next) => {
  const tabKey = req.params.key.toLowerCase();
  const config = projects[tabKey];

  if (!config || !config.enabled) return notConfigured(res, tabKey, 'un proyecto de Jira');

  try {
    const stats = await getBugStats({
      tabKey,
      displayName: displayNameOf(tabKey),
      jiraProjectKey: config.jiraProjectKey,
      bugIssueType: config.bugIssueType,
      hotfixFieldId: config.hotfixFieldId,
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:key/planning', async (req, res, next) => {
  const tabKey = req.params.key.toLowerCase();
  const config = projects[tabKey];

  if (!config || !config.enabled || !config.planningEnabled) {
    return notConfigured(res, tabKey, 'la planificación');
  }

  try {
    const planning = await getPlanning({
      tabKey,
      displayName: displayNameOf(tabKey),
      jiraProjectKey: config.jiraProjectKey,
      planningGroups: config.planningGroups,
    });
    res.json(planning);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
