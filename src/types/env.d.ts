declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_ASTRONOMY_APP_ID: string;
      REACT_APP_ASTRONOMY_APP_SECRET: string;
    }
  }
}

export {};