import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        width: 200,
        height: 32,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    inputContainer: {
        width: '100%',
    },
    inputWrapper: {
        backgroundColor: '#fff',
        borderRadius: 20,
        height: 200,
        flexDirection: 'row',
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    inputLines: {
        flex: 1,
        paddingLeft: 50,
        paddingRight: 40,
        paddingTop: 15,
        gap: 12,
    },
    inputLine: {
        width: '100%',
        height: 16,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    tagsContainer: {
        marginTop: 30,
    },
    tagsTitle: {
        width: 100,
        height: 20,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 15,
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    tag1: { width: 120 },
    tag2: { width: 100 },
    tag3: { width: 90 },
    tag4: { width: 110 },
    tag5: { width: 80 },
    tag6: { width: 95 },
    createButton: {
        marginTop: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        gap: 10,
    },
    buttonIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    buttonText: {
        width: 80,
        height: 20,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
})
