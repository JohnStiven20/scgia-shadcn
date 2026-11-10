import { useEffect } from 'react';
import keycloak from '@/config/keycloak';

const useHookeycloak = () => {
    
    useEffect(() => {

        const initKeycloak = async () => {
            try {
                await keycloak.init({
                    onLoad: 'login-required',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                });

                if (keycloak.authenticated) {
                    console.log('Keycloak authenticated');
                } else {
                    console.error('Keycloak authentication failed');
                }
            } catch (error) {
                console.error('Error initializing Keycloak:', error);
            }
        };

        void initKeycloak();
    }, []);

    return {
        authenticated: keycloak.authenticated,
        token: keycloak.token,
        logout: () => keycloak.logout(),
    };
};

export default useHookeycloak;
