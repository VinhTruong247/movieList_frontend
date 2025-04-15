import axios from 'axios';

const API_URL = 'https://65f43205f54db27bc020c3ff.mockapi.io/api/v1/userData';

export const fetchUsers = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const fetchUserById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with id ${id}:`, error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(API_URL, userData);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Error updating user with id ${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with id ${id}:`, error);
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.get(API_URL);
        const users = response.data;
        
        const user = users.find(u => 
            u.email === email && u.password === password
        );

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            
            // Dispatch auth change event
            window.dispatchEvent(new Event('auth-change'));
            
            return {
                success: true,
                user: userWithoutPassword
            };
        } else {
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const logoutUser = () => {
    try {
        localStorage.removeItem('user');
        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'));
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

export const updateUserFavorites = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating favorites:", error);
        throw error;
    }
};