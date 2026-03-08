import axios from './axiosConfig';

const getSchools = async () => {
    try {
        const response = await axios.get('/schools');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export default {
    getSchools
};
