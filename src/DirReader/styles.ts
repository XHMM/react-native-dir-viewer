import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  readerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  navWrapper: {
    flexDirection: 'row',
    gap: 5,
  },
  navItem: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },

  pathWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    marginBottom: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
  },
});
