import React, { useEffect, useMemo, useState } from "react";
import { Input, IconButton, Text } from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getSuggestions } from "../../services/api";

interface CustomTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit: (val?: string) => void;
  style?: any;
  buttonStyle?: any;
  useSuggestions?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  style,
  buttonStyle,
  useSuggestions,
}) => {
  const [closestSuggestion, setClosestSuggestion] = useState<string | null>(
    null
  );

  useEffect(() => {
    setClosestSuggestion(null);
    const fetchSuggestions = async () => {
      if (!useSuggestions || !value) return;
      const suggestions = await getSuggestions(value);
      if (!suggestions) return;
      setClosestSuggestion(suggestions[0].name);
    };

    fetchSuggestions();
  }, [useSuggestions, value]);

  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={style}
      InputRightElement={
        value ? (
          <>
            {closestSuggestion ? (
              <Text
                onPress={() => {
                  onChangeText(closestSuggestion);
                  onSubmit(closestSuggestion);
                }}
              >
                {closestSuggestion}
              </Text>
            ) : (
              <></>
            )}
            <IconButton
              style={buttonStyle}
              icon={<Ionicons name="arrow-up-outline" size={16} />}
              onPress={() => {
                onSubmit();
              }}
            ></IconButton>
          </>
        ) : (
          <></>
        )
      }
    ></Input>
  );
};

export default CustomTextInput;
