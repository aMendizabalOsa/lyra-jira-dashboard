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
    const statsFor = (jiraProjectKey) =>
      getBugStats({
        tabKey,
        displayName: displayNameOf(tabKey),
        jiraProjectKey,
        bugIssueType: config.bugIssueType,
        hotfixFieldId: config.hotfixFieldId,
        environmentFieldId: config.environmentFieldId,
      });

    const statsGroups = config.statsGroups || (config.statsByPlanningGroup && config.planningGroups);
    if (statsGroups) {
      const groups = await Promise.all(
        statsGroups.map(async (group) => ({
          key: group.key,
          label: group.label,
          icon: group.icon,
          stats: await statsFor(group.jiraProjectKey),
        }))
      );
      return res.json({ tabKey, displayName: displayNameOf(tabKey), groups });
    }

    res.json(await statsFor(config.jiraProjectKey));
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
      recentIssues: config.recentIssues,
    });
    res.json(planning);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
