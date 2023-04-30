import * as React from 'react';

import { SafeAreaView } from 'react-native';
import { Dirs } from 'react-native-file-access';
import { DirReader } from 'react-native-dir-viewer';

export default function App() {
  return (
    <SafeAreaView>
      <DirReader baseDir={Dirs.CacheDir} listHeight={400} containerStyle={{}} />
    </SafeAreaView>
  );
}
