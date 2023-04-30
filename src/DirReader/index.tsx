import React, {
  FC,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FileSystem, Util, FileStat } from 'react-native-file-access';
import {
  Pressable,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ViewProps,
} from 'react-native';
import { foldLongText, format, formatBytes, join, relative } from '../utils';
import { styles } from './styles';
import MyModal from '../components/MyModal';
import MyTextInput from '../components/MyTextInput';

interface DirReaderProps {
  baseDir: string;
  listHeight?: number;
  containerStyle?: ViewProps['style'];
}

export const DirReader: FC<DirReaderProps> = (props) => {
  const { baseDir, listHeight = 300, containerStyle } = props;

  const [files, setFiles] = useState<Array<FileStat>>([]);
  const jumpHistoryRef = useRef<string[]>([baseDir]);
  const [jumpHistoryIdx, setJumpHistoryIdx] = useState(0);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef<number>(0);

  const currentPath = jumpHistoryRef.current[jumpHistoryIdx]!;
  const canJumpBackward = jumpHistoryIdx > 0;
  const canJumpForward = jumpHistoryIdx < jumpHistoryRef.current.length - 1;

  useEffect(() => {
    updateFiles();
  }, []);

  const updateFiles = async (newIdx?: number) => {
    const idx =
      newIdx !== undefined
        ? Math.min(Math.max(0, newIdx), jumpHistoryRef.current.length - 1)
        : jumpHistoryIdx;
    const files = await FileSystem.statDir(jumpHistoryRef.current[idx]!);
    setJumpHistoryIdx(idx);
    setFiles(files);
  };

  const onNavBackwards = () => {
    if (!canJumpBackward) return;
    updateFiles(jumpHistoryIdx - 1);
  };

  const onNavForwards = () => {
    if (!canJumpForward) return;
    updateFiles(jumpHistoryIdx + 1);
  };

  const changePathByClickDir = (dirPath: string) => {
    if (dirPath === baseDir) {
      jumpHistoryRef.current = [dirPath];
      updateFiles(0);
    } else {
      jumpHistoryRef.current.splice(jumpHistoryIdx + 1);
      jumpHistoryRef.current.push(dirPath);
      updateFiles(jumpHistoryRef.current.length - 1);
    }
  };

  return (
    <View style={containerStyle}>
      <View style={styles.readerWrapper}>
        <View style={styles.navWrapper}>
          <NavItem navable={canJumpBackward} onPress={onNavBackwards}>
            {'<'}
          </NavItem>
          <NavItem navable={canJumpForward} onPress={onNavForwards}>
            {'>'}
          </NavItem>
        </View>

        <ActionHandler currentDir={currentPath} updateList={updateFiles} />
      </View>

      <View style={styles.pathWrapper}>
        <TouchableOpacity
          activeOpacity={0.65}
          onPress={() => {
            changePathByClickDir(baseDir);
          }}
        >
          <Text>{foldLongText(baseDir)}</Text>
        </TouchableOpacity>
        {relative(baseDir, currentPath)
          .split('/')
          .filter((i) => i !== '')
          .map((segment, idx, arr) => {
            return (
              <TouchableOpacity
                activeOpacity={0.65}
                key={segment + idx}
                onPress={() => {
                  changePathByClickDir(join(baseDir, ...arr.slice(0, idx + 1)));
                }}
              >
                <Text
                  textBreakStrategy={'simple'}
                  style={{
                    color: 'gray',
                    marginLeft: 2,
                  }}
                >
                  /{segment}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{
          backgroundColor: '#f5f5f5',
          height: listHeight,
        }}
        contentContainerStyle={{}}
        scrollEventThrottle={16}
        onScroll={(ev) => {
          scrollOffsetRef.current = ev.nativeEvent.contentOffset.y;
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {files.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Text
                style={{
                  margin: 5,
                  fontSize: 16,
                  color: 'gray',
                }}
              >
                Empty
              </Text>
            </View>
          ) : (
            files.map((file) => {
              return (
                <DirItem
                  key={`${file.path}-${file.type}`}
                  file={file}
                  onPress={() => {
                    if (file.type === 'directory') {
                      changePathByClickDir(file.path);
                    }
                  }}
                  scrollViewRef={scrollViewRef}
                  scrollOffsetRef={scrollOffsetRef}
                  updateList={updateFiles}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const NavItem: FC<
  PropsWithChildren<{
    navable: boolean;
    onPress: () => void;
  }>
> = ({ navable, onPress, children }) => {
  return (
    <Text
      style={[
        {
          color: navable ? 'gray' : 'rgba(0,0,0,0.2)',
        },
        styles.navItem,
      ]}
      onPress={navable ? onPress : undefined}
    >
      {children}
    </Text>
  );
};

const DirItem: FC<{
  scrollViewRef: MutableRefObject<ScrollView | null>;
  scrollOffsetRef: MutableRefObject<number>;
  file: FileStat;
  onPress?: () => void;
  updateList: () => Promise<void>;
}> = (props) => {
  const { file, onPress, updateList, scrollViewRef, scrollOffsetRef } = props;
  const isDir = file.type === 'directory';

  const [showActionBar, setShowActionBar] = useState(false);
  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const actionRef = useRef<null | View>(null);

  const onDeletePress = async () => {
    Alert.alert('Sure to delete?', file.path, [
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await FileSystem.unlink(file.path);
            await updateList();
          } catch (err) {
            console.error(`Delete file error:`, err);
          }
        },
        style: 'destructive',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const onRenamePress = () => {
    setNewName(file.filename);
    setRenameMode(true);
  };

  const onEditPress = async () => {
    const content = await FileSystem.readFile(file.path);
    setNewContent(content);
    setShowEditModal(true);
  };

  const onRenameFinish = async () => {
    setRenameMode(false);
    if (newName === file.filename) return;
    if (newName.trim() !== '') {
      await FileSystem.mv(file.path, join(Util.dirname(file.path), newName));
      await updateList();
    }
  };

  return (
    <View
      style={{
        marginBottom: 4,
      }}
    >
      <Pressable
        style={(state) => {
          return {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: isDir
              ? state.pressed
                ? `rgba(0, 0, 0, 0.12)`
                : `rgba(0, 0, 0, 0.05)`
              : undefined,
            paddingHorizontal: 10,
            paddingVertical: 5,
          };
        }}
        onPress={onPress}
      >
        <Text>{isDir ? '📁' : '📄'}</Text>

        <View
          style={{
            flexDirection: 'row',
            flexGrow: 1,
            alignItems: 'center',
            gap: 5,
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexBasis: '70%',
            }}
          >
            {renameMode ? (
              <MyTextInput
                value={newName}
                onChangeText={setNewName}
                autoFocus
                onBlur={onRenameFinish}
                onSubmitEditing={onRenameFinish}
                style={{
                  fontSize: 16,
                  marginBottom: 3,
                  backgroundColor: '#bad6fb',
                }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                {file.filename}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: 'gray',
                }}
              >
                {format(file.lastModified)}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: 'gray',
                }}
              >
                {/* dir size is not the actual content size */}
                {isDir ? null : formatBytes(file.size).str}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowActionBar((prev) => !prev);
            }}
            activeOpacity={0.5}
          >
            <Text
              style={{
                padding: 10,
              }}
            >
              ...
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
      {showActionBar ? (
        <View
          ref={actionRef}
          style={{
            backgroundColor: 'rgb(218,218,218)',
            paddingVertical: 5,
            flexDirection: 'row',
            paddingHorizontal: 10,
            gap: 15,
          }}
          onLayout={() => {
            scrollViewRef.current?.measure((...data) => {
              const [, , , scrollViewHeight, , y1] = data;
              actionRef.current?.measure((...data2) => {
                const [, , , height, , y2] = data2;
                const y3 = y2 - y1;
                if (y3 + height > scrollViewHeight) {
                  scrollViewRef.current?.scrollTo({
                    y: scrollOffsetRef.current + height + y3 - scrollViewHeight,
                  });
                }
              });
            });
          }}
        >
          <TouchableOpacity onPress={onDeletePress}>
            <Text>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRenamePress}>
            <Text>Rename</Text>
          </TouchableOpacity>
          {isDir ? null : (
            <TouchableOpacity onPress={onEditPress}>
              <Text>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <MyModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        onLeftPress={() => {
          setShowEditModal(false);
        }}
        onRightPress={async () => {
          await FileSystem.writeFile(file.path, newContent);
          setShowEditModal(false);
          updateList();
        }}
        rightText={'Save'}
      >
        <MyTextInput
          value={newContent}
          onChangeText={setNewContent}
          multiline
          numberOfLines={10}
        />
      </MyModal>
    </View>
  );
};

const ActionHandler: FC<{
  currentDir: string;
  updateList: () => Promise<void>;
}> = ({ currentDir, updateList }) => {
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);

  const [newDirName, setNewDirName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  const onNewDirPress = () => {
    setShowCreateDirModal(true);
  };

  const onNewFilePress = () => {
    setShowCreateFileModal(true);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
      }}
    >
      <TouchableOpacity onPress={onNewDirPress}>
        <Text>New dir</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNewFilePress}>
        <Text>New file</Text>
      </TouchableOpacity>

      <MyModal
        visible={showCreateDirModal}
        onClose={() => {
          setShowCreateDirModal(false);
        }}
        onLeftPress={() => {
          setShowCreateDirModal(false);
        }}
        onRightPress={async () => {
          try {
            await FileSystem.mkdir(join(currentDir, newDirName));
            await updateList();
            setShowCreateDirModal(false);
          } catch (e) {
            console.error('Create dir error:', e);
          }
        }}
      >
        <MyTextInput
          placeholder={'dir name'}
          value={newDirName}
          onChangeText={setNewDirName}
          autoFocus
        />
      </MyModal>

      <MyModal
        visible={showCreateFileModal}
        onClose={() => {
          setShowCreateFileModal(false);
        }}
        onRightPress={async () => {
          try {
            await FileSystem.writeFile(
              join(currentDir, newFileName),
              newFileContent
            );
            await updateList();
            setShowCreateFileModal(false);
          } catch (e) {
            console.error('Create file error:', e);
          }
        }}
        onLeftPress={() => {
          setShowCreateFileModal(false);
        }}
      >
        <MyTextInput
          autoFocus
          placeholder={'file name'}
          value={newFileName}
          onChangeText={setNewFileName}
        />
        <MyTextInput
          placeholder={'file content'}
          value={newFileContent}
          numberOfLines={5}
          multiline
          onChangeText={setNewFileContent}
          style={[
            {
              height: 100,
            },
          ]}
        />
      </MyModal>
    </View>
  );
};
