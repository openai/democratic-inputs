import React from 'react'
import {
    Flex,
    Checkbox,
    HStack,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
    FormErrorMessage,
    Tooltip,
    Select,
    Textarea,
  } from "@chakra-ui/react";
export default function Comment() {
  return (
    <div>
    
    
    <form>
        Comments(2) 
    <Stack spacing={4}>
        
      <FormControl id='comment'>
      <Textarea
        
        placeholder='Write your comment'
      />
    </FormControl>
    <HStack spacing={4} pt={2}>
    <Tooltip>
      <Button
        loadingText='Submitting'
        size='lg'
        bg={"blue.400"}
        color={"white"}
        _hover={{
          bg: "blue.500",
        }}
        type='submit'
        // isLoading={isLoading}
      >
        Submit
      </Button>
    </Tooltip>
    <Button
      size='lg'
      bg={"gray.400"}
      color={"white"}
      _hover={{
        bg: "gray.500",
      }}
    //   onClick={onCancel}
    >
      Cancel
    </Button>
  </HStack>

    </Stack>
  </form>
    
    
    </div>
  )
}
