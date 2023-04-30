import React, { FC, PropsWithChildren } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const MyModal: FC<
  PropsWithChildren<{
    visible: boolean;
    onClose: () => void;
    onLeftPress: () => void;
    onRightPress: () => void;
    rightText?: string;
  }>
> = ({ visible, onClose, children, onRightPress, onLeftPress, rightText }) => {
  return (
    <Modal
      onRequestClose={() => {
        onClose();
      }}
      presentationStyle={'formSheet'}
      animated
      animationType={'slide'}
      style={{
        marginTop: 40,
        height: 400,
      }}
      visible={visible}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity activeOpacity={0.5} style={{}} onPress={onLeftPress}>
          <Text
            style={{
              fontSize: 18,
              padding: 15,
              color: 'gray',
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} onPress={onRightPress}>
          <Text
            style={{
              fontSize: 18,
              padding: 15,
              color: 'black',
              fontWeight: '600',
            }}
          >
            {rightText ?? 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </Modal>
  );
};

export default MyModal;
