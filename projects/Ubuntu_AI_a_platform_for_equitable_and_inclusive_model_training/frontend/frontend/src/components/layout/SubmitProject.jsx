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
  import {LOGIN, ROOT} from "../../lib/routes";
  import {Link as routerLink} from "react-router-dom";
  import {useForm, Controller} from "react-hook-form";
  import {
    usernameValidate,
    passwordValidate,
    emailValidate,
  } from "../../utils/form-validation";
import Navbar from './Navbar';
export default function SubmitProject() {

    const ladelBtn = "Don' t hesitate to submit a project";

    const {
        // register,
        handleSubmit,
        formState: {errors},
        control,
      } = useForm();

      async function handleRegister(data) {
        // signup({
        //   username: data.username,
        //   email: data.email,
        //   password: data.password,
        //   redirectTo: ROOT,
        // });
      }
  return (
        <div>
        <Navbar />
        <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
   
      <Stack spacing={8} mx={"auto"} maxW={"lg"} minW={700} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            What is your project?
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={handleSubmit(handleRegister)}>
            <Stack spacing={4}>
              <FormControl id='title' isInvalid={errors.username}>
                <Input
                  type='text'
                  placeholder='Title'
                  // {...register("username", usernameValidate)}
                />
                <FormErrorMessage>
                  {errors.username && errors.username.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl id='description' isInvalid={errors.description}>
              <Textarea
                
                placeholder='Description'
              />
              <FormErrorMessage>
                {errors.description && errors.description.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl id='image' isInvalid={errors.image}>
            <Input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const selectedFile = e.target.files[0];
              }}
            />
            <FormErrorMessage>
              {errors.image && errors.image.message}
            </FormErrorMessage>
          </FormControl>
              <FormControl id='organization' isInvalid={errors.username}>
              
              <Input
                type='text'
                placeholder='Link to your main project'
                // {...register("organisation", usernameValidate)}
              />
              <FormErrorMessage>
                {errors.username && errors.username.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl id='agreeToTerms' isInvalid={errors.agreeToTerms}>
        <Checkbox
        >
          Make your image publicly seen
        </Checkbox>
        <FormErrorMessage>
          {errors.agreeToTerms && errors.agreeToTerms.message}
        </FormErrorMessage>
      </FormControl>
            <HStack spacing={4} pt={2}>
            <Tooltip label={ladelBtn}>
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
        </Box>
      </Stack>
    </Flex>
        
        </div>
    
  )
}
