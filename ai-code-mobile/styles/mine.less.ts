import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        position: 'relative',
    },
    settingsIcon: {
        position: 'absolute',
        top: 24,
        right: 24,
        padding: 8,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    userAccount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    userProfile: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    appsSection: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchContainer: {
        backgroundColor: '#f5f5f5',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingHorizontal: 16,
    },
    searchInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    footerText: {
        marginLeft: 10,
        color: '#666',
    },
    notLoggedInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    notLoggedInText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    notLoggedInHint: {
        fontSize: 14,
        color: '#999',
    },
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    drawerContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 300,
        backgroundColor: '#fff',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    drawerItemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
})
