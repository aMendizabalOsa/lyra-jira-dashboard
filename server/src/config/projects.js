// Fuente de verdad: pestaña del dashboard -> proyecto real de Jira.
// Para activar una pestaña nueva, basta con poner su jiraProjectKey real,
// su hotfixFieldId (customfield_XXXXX del checkbox "Hotfix" de ese proyecto,
// consultable vía GET /rest/api/3/field) y enabled: true.
module.exports = {
  lyra: {
    jiraProjectKey: 'LYRA',
    bugIssueType: 'Bug',
    hotfixFieldId: 'customfield_10154',
    enabled: true,
  },
  cpuapp: { jiraProjectKey: null, bugIssueType: 'Bug', hotfixFieldId: null, enabled: false },
  // DspApp no es un único proyecto de Jira: son 18 proyectos "DspApp:*"
  // (uno por variante de hardware/control), todos comparten el mismo campo
  // Hotfix (customfield_10154, verificado contra DSP12 y DSP36).
  dspapp: {
    jiraProjectKey: [
      'DSP2', 'DSP3', 'DSP4', 'DSP5', 'DSP6', 'DSP7', 'DSP12', 'DSP15', 'DSP16',
      'DSP17', 'DSP19', 'DSP20', 'DSP23', 'DSP26', 'DSP30', 'DSP34', 'DSP35', 'DSP36',
    ],
    bugIssueType: 'Bug',
    hotfixFieldId: 'customfield_10154',
    enabled: true,
  },
  // FpgaApp tampoco es un único proyecto: son 19 proyectos "FpgaApp:*"
  // (mismo patrón que DspApp), comparten customfield_10154 (verificado con FPGA1).
  fpgaapp: {
    jiraProjectKey: [
      'FPGA1', 'FPGA2', 'FPGA3', 'FPGA6', 'FPGA9', 'FPGA10', 'FPGA11', 'FPGA13',
      'FPGA16', 'FPGA20', 'FPGA21', 'FPGA22', 'FPGA24', 'FPGA27', 'FPGA29',
      'FPGA32', 'FPGA33', 'FPGA35', 'FPGA39',
    ],
    bugIssueType: 'Bug',
    hotfixFieldId: 'customfield_10154',
    enabled: true,
  },
};
