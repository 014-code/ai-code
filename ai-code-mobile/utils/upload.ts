import {Platform} from 'react-native';
import {getToken} from "./cookies";

const BASE_URL = Platform.OS === 'android'
    ? "http://10.0.2.2:8123"
    : "http://localhost:8123";

export async function uploadFile(fileUri: string, fileName: string = 'image.jpg') {
    const token = await getToken();

    const formData = new FormData();
    formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: fileName,
    } as any);

    return new Promise((resolve, reject) => {
        fetch(`${BASE_URL}/api/file/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
            .then(response => response.json())
            .then(result => {
                if (result.code === 0) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}
