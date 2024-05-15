interface Toast {
  id?: number;
  type?: 'success' | 'info' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  timeout?: number;
}

// export const toasts = writable<Toast[]>( [] );
export const toasts = $state<Toast[]>( [] );

export const addToast = ( toast: Toast ) => {
  // Create a unique ID so we can easily find/remove it
  // if it is dismissible/has a timeout.
  const id = new Date().getTime();


  // Setup some sensible defaults for a toast.
  const defaults = {
    id,
    type: "info",
    dismissible: true,
    timeout: 3000,
  } as Toast;

  toast = { ...defaults, ...toast };

  if ( !toast.title ) toast.title = toast.type?.toUpperCase();

  // Push the toast to the top of the list []
  toasts.unshift( toast );

  // If toast is dismissible, dismiss it after "timeout" amount of time.
  if ( toast.timeout ) setTimeout( () => dismissToast( id ), toast.timeout );
};

export const dismissToast = ( id: number ) => {
  // delete toast with id inplace
  toasts.splice( toasts.findIndex( ( t ) => t.id === id ), 1 );
};