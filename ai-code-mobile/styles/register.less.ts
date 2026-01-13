import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    height: '35%',
    width: '100%',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  titleOverlay: {
    alignItems: 'center',
  },
  formContainer: {
    paddingTop: 50,
    height: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  inputContainer: {
    width: 300,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginTop: 50
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  formContent: {
    gap: 20,
  },
});
