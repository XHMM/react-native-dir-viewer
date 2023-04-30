import React, { FC } from 'react';
import { TextInput, TextInputProps } from 'react-native';

const MyTextInput: FC<TextInputProps> = (props) => {
  return (
    <TextInput
      autoCapitalize={'none'}
      autoCorrect={false}
      clearButtonMode={'always'}
      {...props}
      style={[
        {
          fontSize: 16,
          borderWidth: 1,
          padding: 6,
          margin: 5,
        },
        props.style,
      ]}
    />
  );
};

export default MyTextInput;
