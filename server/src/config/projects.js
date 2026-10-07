// Fuente de verdad: pestaña del dashboard -> proyecto real de Jira.
// Para activar una pestaña nueva, basta con poner su jiraProjectKey real,
// su hotfixFieldId (customfield_XXXXX del checkbox "Hotfix" de ese proyecto,
// consultable vía GET /rest/api/3/field), su environmentFieldId (select
// "Environment -", customfield_10302, igual en los cuatro) y enabled: true.
module.exports = {
  lyra: {
    jiraProjectKey: 'LYRA',
    bugIssueType: 'Bug',
    hotfixFieldId: 'customfield_10154',
    environmentFieldId: 'customfield_10302',
    enabled: true,
    // Planificación de Lyra: issues creados en el último periodo (window) por tipo
    // (ver services/planningService.js).
    planningEnabled: true,
    // Tres recuentos por tipo, de más estricto a más amplio (`tiers`, en el orden en que se muestran). `unplanned`
    // es "sin planificar": sin sprint para Bug/Story/FormalDoc, fuera de To Do
    // para Task (se mira el estado, no el sprint). `unplannedHigh` añade
    // prioridad superior a Low.
    recentIssues: {
      window: '-30d', // JQL relativo (ojo: -1M sería 1 minuto, no 1 mes)
      windowLabel: 'los últimos 30 días',
      tiers: [
        { key: 'unplannedHigh', label: 'Sin planificar, prioridad > Low' },
        { key: 'unplanned', label: 'Sin planificar' },
        { key: 'all', label: 'Nuevos' },
      ],
      issueTypes: [
        { type: 'Bug', unplannedFilter: 'sprint is EMPTY' },
        { type: 'Story', unplannedFilter: 'sprint is EMPTY' },
        { type: 'Task', unplannedFilter: 'status != "To Do"' },
        { type: 'FormalDoc', unplannedFilter: 'sprint is EMPTY' },
      ],
    },
  },
  // CpuApp no es un único proyecto: son 22 proyectos "CpuApp:*" (mismo
  // patrón que DspApp), comparten customfield_10154 (verificado con CPU3, CPU16
  // y CPU44). Se excluye CPU2 (CpuApp:Compac3) a petición del usuario.
  cpuapp: {
    jiraProjectKey: [
      'CPU3', 'CPU4', 'CPU6', 'CPU7', 'CPU8', 'CPU9', 'CPU16', 'CPU21', 'CPU22',
      'CPU26', 'CPU27', 'CPU28', 'CPU29', 'CPU30', 'CPU31', 'CPU35', 'CPU39',
      'CPU43', 'CPU44', 'CPU45', 'CPU48',
    ],
    bugIssueType: 'Bug',
    hotfixFieldId: 'customfield_10154',
    environmentFieldId: 'customfield_10302',
    enabled: true,
    // Sub-pestaña "Planificación" (ver services/planningService.js). Se separa
    // Compac3 (tranvía; CpuApp:Compac3* y Compac3S*) del resto, que son
    // aplicaciones genéricas de test.
    planningEnabled: true,
    planningGroups: [
      {
        key: 'generic',
        label: 'Aplicaciones genéricas de test',
        jiraProjectKey: [
          'CPU6', 'CPU7', 'CPU8', 'CPU9', 'CPU16', 'CPU21', 'CPU22', 'CPU26',
          'CPU27', 'CPU28', 'CPU29', 'CPU39', 'CPU43', 'CPU44', 'CPU45', 'CPU48',
        ],
      },
      {
        key: 'compac3',
        label: 'Compac3',
        icon: '🚋',
        jiraProjectKey: ['CPU3', 'CPU4', 'CPU30', 'CPU31', 'CPU35'],
      },
    ],
  },
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
    environmentFieldId: 'customfield_10302',
    enabled: true,
    // Planificación por tipo de convertidor, como en FpgaApp. No hay proyectos
    // APS; en su lugar se separa el rectificador trifásico (1RectTri) del
    // monofásico (1RectMono, grupo "Rectifier").
    planningEnabled: true,
    planningGroups: [
      {
        key: 'inverter',
        label: 'Inversor',
        jiraProjectKey: [
          'DSP2', 'DSP3', 'DSP4', 'DSP5', 'DSP12', 'DSP15', 'DSP16', 'DSP17', 'DSP20', 'DSP34', 'DSP35', 'DSP36',
        ],
      },
      { key: 'rectifier', label: 'Rectifier', jiraProjectKey: ['DSP7', 'DSP19', 'DSP26', 'DSP30'] },
      { key: 'dcdc', label: 'DcDc', jiraProjectKey: ['DSP23'] },
      { key: 'recttri', label: 'RectTri', jiraProjectKey: ['DSP6'] },
    ],
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
    environmentFieldId: 'customfield_10302',
    enabled: true,
    // Planificación separada por tipo de convertidor, según el nombre del
    // proyecto: 1Rect, 1Dcdc, 1Aps e inversor (1Inv, y también los 2Inv).
    // FPGA11 (1ApsInv1BattCharg) va a APS: es "1Aps", no "1Inv".
    planningEnabled: true,
    planningGroups: [
      {
        key: 'inverter',
        label: 'Inversor',
        jiraProjectKey: ['FPGA1', 'FPGA2', 'FPGA3', 'FPGA20', 'FPGA22', 'FPGA27', 'FPGA39'],
      },
      { key: 'rectifier', label: 'Rectifier', jiraProjectKey: ['FPGA6', 'FPGA13', 'FPGA16', 'FPGA24', 'FPGA29', 'FPGA35'] },
      { key: 'dcdc', label: 'DcDc', jiraProjectKey: ['FPGA9', 'FPGA21', 'FPGA32', 'FPGA33'] },
      { key: 'aps', label: 'APS', jiraProjectKey: ['FPGA10', 'FPGA11'] },
    ],
  },
};
