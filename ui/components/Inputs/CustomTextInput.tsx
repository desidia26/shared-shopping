import React from "react";
import { Input, IconButton } from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";

interface CustomTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit: (val: string) => void;
  style?: any;
  buttonStyle?: any;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  style,
  buttonStyle,
}) => {
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={style}
      InputRightElement={
        value ? (
          <IconButton
            style={buttonStyle}
            icon={<Ionicons name="arrow-up-outline" size={16} />}
            onPress={() => {
              onSubmit(value);
            }}
          ></IconButton>
        ) : (
          <></>
        )
      }
    ></Input>
  );
};

export default CustomTextInput;
