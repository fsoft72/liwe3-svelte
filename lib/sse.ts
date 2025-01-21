/* eslint-disable @typescript-eslint/no-explicit-any */

// SPECIAL EVENTS
// connected - fired when SSE connects
// error - fired when SSE connection error occurs

class SSEClient {
    private readonly listeners: Record<string, ( message: any ) => void> = {};
    private eventSource: EventSource | null = null;
    private connected: boolean = false;
    private url: string;

    constructor ( url: string ) {
        this.url = url;
    }

    public connect = () => {
        if ( this.eventSource ) return;

        this.eventSource = new EventSource( this.url );

        this.setupEventListeners();

        if ( this.listeners[ 'connected' ] ) {
            this.listeners[ 'connected' ]( { action: 'connected', data: 'Connected to server' } );
        }
    };

    public disconnect = () => {
        if ( this.eventSource ) {
            this.eventSource.close();
            this.eventSource = null;
        }
    };

    private setupEventListeners = () => {
        if ( !this.eventSource ) return;

        this.eventSource.onopen = () => {
            this.connected = true;

            if ( this.listeners[ 'connected' ] ) {
                this.listeners[ 'connected' ]( { action: 'open', data: 'Connection opened' } );
            }
        };

        this.eventSource.onerror = () => {
            this.connected = false;

            if ( this.eventSource ) {
                this.eventSource.close();
                this.eventSource = null;
            }

            if ( this.listeners[ 'error' ] ) {
                this.listeners[ 'error' ]( { action: 'error', data: 'Connection error' } );
            }

            setTimeout( () => {
                this.connect();
            }, 1000 );
        };

        this.eventSource.onmessage = ( event ) => {
            const message = JSON.parse( event.data );

            if ( this.listeners[ message.action ] ) {
                this.listeners[ message.action ]( message );
            }
        };
    };

    public addActionListener ( action: string, listener: ( message: any ) => void ): void {
        this.listeners[ action ] = listener;
    }

    public isConnected (): boolean {
        return this.connected;
    }
}

export default SSEClient;