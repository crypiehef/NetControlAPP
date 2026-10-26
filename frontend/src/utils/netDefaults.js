export const FALLBACK_NET_NAME = 'York County Amateur Radio Society Net';

// Build the initial Start Net / Schedule form values from the user's saved net defaults
export const buildNetFormDefaults = (settings, user) => {
  const defaults = settings?.netDefaults || {};
  return {
    netName: defaults.netName || (defaults.clubName ? `${defaults.clubName} Net` : FALLBACK_NET_NAME),
    clubName: defaults.clubName || '',
    frequency: defaults.frequency || '',
    netControllerCallsign: defaults.netControllerCallsign || user?.callsign || '',
    netControllerName: defaults.netControllerName || '',
    loggerCallsign: '',
    loggerName: ''
  };
};

// "K4HEF - Jason" style label; either part may be missing
export const formatStation = (callsign, name) => [callsign, name].filter(Boolean).join(' - ');
