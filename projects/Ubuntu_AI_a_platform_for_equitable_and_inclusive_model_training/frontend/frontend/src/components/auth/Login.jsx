import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import {useState} from "react";
import {REGISTER, ROOT} from "../../lib/routes";
import {Link as routerLink} from "react-router-dom";
import {useForm} from "react-hook-form";
import {emailValidate, passwordValidate} from "../../utils/form-validation";
// import {useLogin} from "../../hooks/auths";
export default function Login() {
  const [show, setShow] = useState(false);
  // const {login, isLoading} = useLogin();

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm();

  async function handleLogin(data) {
    // const succeeded = await login({
    //   email: data.email,
    //   password: data.password,
    //   redirectTo: ROOT,
    // });
    // if (succeeded) reset();
  }
  const handleClick = () => setShow(!show);
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} minW={500} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Let's unlock</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Time to get your login on ✌️
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <form onSubmit={handleSubmit(handleLogin)}>
              <FormControl id='email' isInvalid={errors.email}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type='text'
                  placeholder='user@email.com'
                  // {...register("email", emailValidate)}
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl id='password' mb={3} isInvalid={errors.email}>
                <FormLabel>Password</FormLabel>
                <InputGroup size='md'>
                  <Input
                    placeholder='Password123'
                    type={show ? "text" : "password"}
                    // {...register("password", passwordValidate)}
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                  <FormErrorMessage>
                    {errors.password && errors.password.message}
                  </FormErrorMessage>
                </InputGroup>
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{base: "column", sm: "row"}}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Link as={routerLink} to={ROOT} color={"blue.400"}>
                    Explore projects?
                  </Link>
                </Stack>
                <Button
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type='submit'
                  // isLoading={isLoading}
                  loadingText='Logging In'
                >
                  Sign in
                </Button>
              </Stack>
            </form>
            <Stack pt={6}>
              <Text align={"center"}>
                New user here? Join the community!{" "}
                <Link color={"blue.400"} as={routerLink} to={REGISTER}>
                  Register
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
