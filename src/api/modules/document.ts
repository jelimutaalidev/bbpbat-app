import api from '../core/apiClient';

// API DOKUMEN PESERTA
export const uploadDocument = (jenisDokumen: string, file: File) => {
    const formData = new FormData();
    formData.append('jenis_dokumen', jenisDokumen);
    formData.append('file', file);

    return api.post('/peserta/dokumen/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
