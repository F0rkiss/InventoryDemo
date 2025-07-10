    import React, { useState, useEffect, useContext, createContext } from 'react';
    import { jwtDecode } from 'jwt-decode'; 

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
        const [auth, setAuth] = useState(() => {
            const token = localStorage.getItem('authToken');
            return token ? { token } : null;
        });

        const getFromToken = (key, token) => {
            if (!token) return null;
            try {
                const decoded = jwtDecode(token);
                // console.log(decoded)
                return decoded[key];
            } catch (error) {
                localStorage.removeItem('authToken')
                return null;
            }
        };
    
        const token = localStorage.getItem('authToken');
        const role = getFromToken('role', token);
        const name = getFromToken('user', token);
        const email = getFromToken('email', token);
        const navigation_menu = getFromToken('navigation menu', token);

        
        useEffect(() => {
            // Update localStorage whenever auth changes
            if (auth?.token) {
                localStorage.setItem('authToken', auth.token);
            } else {
                localStorage.removeItem('authToken');
            }
        }, [auth]);
        
        return (
            <AuthContext.Provider value={{ auth, setAuth, role, name, email, navigation_menu }}>
                {children}
            </AuthContext.Provider>
        );
    };

    export const useAuth = () => {
        return useContext(AuthContext);
    };

    export {AuthContext}