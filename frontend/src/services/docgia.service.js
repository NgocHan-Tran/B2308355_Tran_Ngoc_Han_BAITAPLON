import axios from "axios";

const API_URL = "http://localhost:3000/api/docgia";

class DocGiaService {
    async getAll() {
        return (await axios.get(API_URL)).data;
    }

    async get(id) {
        return (await axios.get(`${API_URL}/${id}`)).data;
    }

    async create(data) {
        return (await axios.post(API_URL, data)).data;
    }

    async update(id, data) {
        return (await axios.put(`${API_URL}/${id}`, data)).data;
    }

    async delete(id) {
        return (await axios.delete(`${API_URL}/${id}`)).data;
    }

    async findBySearch(searchText) {
        return (await axios.get(`${API_URL}?search=${searchText}`)).data;
    }
}

export default new DocGiaService();
