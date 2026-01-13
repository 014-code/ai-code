import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#e0e0e0',
    },
    titleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        width: 120,
        height: 20,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 8,
    },
    meta1: {
        width: 80,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 6,
    },
    meta2: {
        width: 60,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    expandButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e0e0e0',
    },
    coverImage: {
        width: '100%',
        height: 220,
        backgroundColor: '#e0e0e0',
    },
    actionContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e0e0e0',
    },
    buttonLeft: {
        backgroundColor: '#d0d0e0',
    },
    buttonRight: {
        backgroundColor: '#e0d0d0',
    },
})
