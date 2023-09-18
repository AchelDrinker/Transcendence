import axios from 'axios';

export const fetchUser = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.get(`${apiUrl}/user`, { withCredentials: true });
    if (response.data) {
      return response.data;
    } else {
      // Redirection si l'utilisateur n'est pas authentifié
      window.location.href = '/';
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur :', error);
    window.location.href = '/';
    return null;
  }
};
