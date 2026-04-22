declare namespace NailAide {
    interface Config {
      apiKey: string;
      businessName: string;
      businessType: string;
      primaryColor?: string;
      position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
      welcomeMessage?: string;
      bookingUrl?: string;
      endpoint?: string;
    }
    
    function init(config: Config): void;
  }
  
  /// <reference path="./nailaide.d.ts" />
