const axios = require('axios');
const xml2js = require('xml2js');

class QRZService {
  constructor() {
    this.sessionKey = null;
    this.baseURL = 'https://xmldata.qrz.com/xml/current/';
  }

  // Get session key
  async getSessionKey(username, password) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          username,
          password
        }
      });

      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
      
      if (result.QRZDatabase.Session[0].Key) {
        this.sessionKey = result.QRZDatabase.Session[0].Key[0];
        return this.sessionKey;
      }
      
      throw new Error('Failed to get session key');
    } catch (error) {
      console.error('QRZ Session Error:', error.message);
      throw error;
    }
  }

  // Lookup callsign with direct API key (username:password format or just username for subscribers)
  async lookupCallsign(callsign, apiKey) {
    try {
      let username, password;
      
      // Check if apiKey contains username:password format
      if (apiKey.includes(':')) {
        [username, password] = apiKey.split(':');
      } else {
        // If no colon, treat it as just username (for XML subscribers who can use their callsign/username)
        username = apiKey;
        password = apiKey; // QRZ allows using username as password for XML subscribers
      }

      // First, get a session key if we don't have one
      if (!this.sessionKey) {
        await this.getSessionKey(username, password);
      }

      // Attempt lookup with session key
      const response = await axios.get(this.baseURL, {
        params: {
          s: this.sessionKey,
          callsign: callsign.toUpperCase()
        }
      });

      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
      
      // Check for session error and retry once with new session
      if (result.QRZDatabase && result.QRZDatabase.Session && result.QRZDatabase.Session[0].Error) {
        console.log('Session expired, getting new session key...');
        this.sessionKey = null;
        await this.getSessionKey(username, password);
        
        // Retry the lookup
        const retryResponse = await axios.get(this.baseURL, {
          params: {
            s: this.sessionKey,
            callsign: callsign.toUpperCase()
          }
        });
        
        const retryResult = await parser.parseStringPromise(retryResponse.data);
        
        if (retryResult.QRZDatabase && retryResult.QRZDatabase.Callsign) {
          const callsignData = retryResult.QRZDatabase.Callsign[0];
          return this.formatCallsignData(callsignData, callsign);
        }
        
        return null;
      }
      
      if (result.QRZDatabase && result.QRZDatabase.Callsign) {
        const callsignData = result.QRZDatabase.Callsign[0];
        return this.formatCallsignData(callsignData, callsign);
      }
      
      return null;
    } catch (error) {
      console.error('QRZ Lookup Error:', error.message);
      if (error.response) {
        console.error('QRZ Response:', error.response.data);
      }
      // Reset session key on error
      this.sessionKey = null;
      return null;
    }
  }

  // Helper method to format callsign data
  formatCallsignData(callsignData, callsign) {
    // Build location string from city, state
    const city = callsignData.addr2 ? callsignData.addr2[0] : '';
    const state = callsignData.state ? callsignData.state[0] : '';
    const location = [city, state].filter(Boolean).join(', ');
    
    return {
      callsign: callsignData.call ? callsignData.call[0] : callsign,
      name: callsignData.fname ? `${callsignData.fname[0]} ${callsignData.name ? callsignData.name[0] : ''}`.trim() : '',
      location: location,
      address: callsignData.addr1 ? callsignData.addr1[0] : '',
      city: city,
      state: state,
      zip: callsignData.zip ? callsignData.zip[0] : '',
      country: callsignData.country ? callsignData.country[0] : '',
      license_class: callsignData.class ? callsignData.class[0] : '',
      email: callsignData.email ? callsignData.email[0] : ''
    };
  }
}

module.exports = new QRZService();

