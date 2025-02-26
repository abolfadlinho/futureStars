const getLogo = (team: string) => {
    const logoMap: { [key: string]: any } = {
        'ahly.png': require('@/assets/images/uploads/ahly.png'),
        'zamalek.png': require('@/assets/images/uploads/zamalek.png'),
        'mahalla.png': require('@/assets/images/uploads/mahalla.png'),
        'smouha.png': require('@/assets/images/uploads/smouha.png'),
        'heliopolis.png': require('@/assets/images/uploads/heliopolis.png'),
        'ismaily.png': require('@/assets/images/uploads/ismaily.png'),
        'almasry.png': require('@/assets/images/uploads/almasry.png'),
        'aswan.png': require('@/assets/images/uploads/aswan.png'),
        'ittihad.png': require('@/assets/images/uploads/alittihad.png'),
        'sporting.png': require('@/assets/images/uploads/sporting.png'),
    };
    return logoMap[team] || require('@/assets/images/uploads/futureStars.png');
}

export default getLogo;