import { images } from "../../constants";

export const themes = {
  atlaa: {
    light: {
      dark: false,
      colors: {
        primary: '#F48FB1',        
        secondary: '#C51162',      
        tertiary: '#FFCDD2',       
        background: '#F7F9FC',    
        card: '#FBE9E7',           
        text: '#111111',         
        overlay: 'rgba(0,0,0,0.3)' 
      }
    },
    dark: {
      dark: true,
      colors: {
        primary: '#4081A5',
        secondary: '#4A4545',
        tertiary: 'rgb(26, 35, 126)',
        background: '#15111D',
        card: '#1f2937',
        text: '#ffffff',
        overlay: 'rgba(0,0,0,0.5)'
      }
    },
    compLogo: images.logo
  },
  orgA: {
    light: {
      dark: false,
      colors: {
        primary: '#27ae60',
        background: '#f0f0f0',
        card: '#ffffff',
        text: '#000000',
        border: '#cccccc',
        notification: '#ff5252',
        overlay: 'rgba(0,0,0,0.5)'
      }
    },
    dark: {
      dark: true,
      colors: {
        primary: '#219150',
        background: '#222222',
        card: '#2a2a2a',
        text: '#ffffff',
        border: '#555',
        notification: '#ff6b6b',
        overlay: 'rgba(0,0,0,0.5)'
      }
    },
    compLogo: images.logo
  }
};

// Choose tenant and mode dynamically
export const currentOrg = 'atlaa';
export const logo = themes[currentOrg].compLogo