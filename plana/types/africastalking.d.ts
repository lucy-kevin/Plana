declare module 'africastalking' {
  interface ATOptions {
    username: string;
    apiKey: string;
  }

  interface SMSSendOptions {
    to: string[];
    message: string;
    from?: string;
  }

  interface ATInstance {
    SMS: {
      send(options: SMSSendOptions): Promise<unknown>;
    };
  }

  function AfricasTalking(options: ATOptions): ATInstance;
  export = AfricasTalking;
}
