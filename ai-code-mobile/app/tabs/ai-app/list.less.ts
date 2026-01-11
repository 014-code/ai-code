import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
})
