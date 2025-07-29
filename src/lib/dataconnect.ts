
'use client';

import { 
    FirebaseDataConnect, 
    getFirebaseDataConnect,
} from 'firebase/app-check';

let dataConnect: FirebaseDataConnect | null = null;

export function getDataConnect() {
    if (!dataConnect) {
        dataConnect = getFirebaseDataConnect('default-connector');
    }
    return dataConnect;
}
