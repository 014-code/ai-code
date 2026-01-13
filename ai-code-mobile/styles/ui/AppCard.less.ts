import { StyleSheet } from 'react-native';

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
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#999',
  },
  expandButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  coverImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  skeletonCover: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  skeletonTitle: {
    width: 120,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  skeletonSubtitle: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: '#009ff4ff',
  },
  chatButton: {
    borderRadius: 25,
    paddingVertical: 12,
  },
  appButton: {
    backgroundColor: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
    borderRadius: 25,
    paddingVertical: 12,
  },
});
