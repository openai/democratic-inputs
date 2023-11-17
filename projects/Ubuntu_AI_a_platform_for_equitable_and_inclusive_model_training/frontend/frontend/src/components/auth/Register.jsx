import {
  Flex,
  Checkbox,
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
} from "@chakra-ui/react";
import {LOGIN, ROOT} from "../../lib/routes";
import {Link as routerLink} from "react-router-dom";
import {useForm, Controller} from "react-hook-form";
import {
  usernameValidate,
  passwordValidate,
  emailValidate,
} from "../../utils/form-validation";
// import {useRegister} from "../../hooks/auths";

export default function Register() {
  // const {register: signup, isLoading} = useRegister();
  const countries = [
    { value: 'Gh', label: 'Ghana' },
    { value: 'Ug', label: 'Uganda' },
    { value: 'Zb', label: 'Zimbabi' },
    { value: 'oth', label: 'Others' },
  ];
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'non binary' },
    { value: 'pefer to not disclose', label: 'prefer to not disclose' },
    { value: 'prefer to self describe', label: 'prefer to self describe' },
    { value: 'other', label: 'Other' },
  ];
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
  const ladelBtn = "Don' t be a stranger, sign up!";
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} minW={500} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
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
              <FormControl id='username' isInvalid={errors.username}>
                <FormLabel>UserName</FormLabel>
                <Input
                  type='text'
                  placeholder='username'
                  // {...register("username", usernameValidate)}
                />
                <FormErrorMessage>
                  {errors.username && errors.username.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl id='email' isInvalid={errors.email}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type='email'
                  placeholder='user@email.com'
                  // {...register("email", emailValidate)}
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl id='password' isInvalid={errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  placeholder='Password123'
                  // {...register("password", passwordValidate)}
                />
                <FormErrorMessage>
                  {errors.password && errors.password.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl id='organization' isInvalid={errors.username}>
              <FormLabel>Organization</FormLabel>
              <Input
                type='text'
                placeholder='your organization'
                // {...register("organisation", usernameValidate)}
              />
              <FormErrorMessage>
                {errors.username && errors.username.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl id="country" isInvalid={errors.country}>
                <FormLabel>Country</FormLabel>
                <Controller
                  name="country"
                  control={control}
                  defaultValue="" // Set the default selected country value here
                  rules={{ required: 'Please select a country' }} // Add any validation rules if needed
                  render={({ field }) => (
                    <Select placeholder="Select country" {...field}>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
      <FormErrorMessage>{errors.country && errors.country.message}</FormErrorMessage>
            </FormControl>
            <FormControl id="gender" isInvalid={errors.gender}>
            <FormLabel>Gender</FormLabel>
            <Controller
              name="gender"
              control={control}
              defaultValue="" // Set the default selected gender value here
              rules={{ required: 'Please select a gender' }} // Add any validation rules if needed
              render={({ field }) => (
                <Select placeholder="Select gender" {...field}>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            />
            <FormErrorMessage>{errors.gender && errors.gender.message}</FormErrorMessage>
          </FormControl>
          <FormControl id="terms" isInvalid={errors.terms}>
          <Controller
            name="terms"
            control={control}
            defaultValue={false} // Set the default checkbox value here (e.g., false or true)
            rules={{ required: 'You must agree to the terms and conditions' }} // Add any validation rules if needed
            render={({ field }) => (
              <>
                <Checkbox {...field} size="lg" colorScheme="blue">
                  I agree to the terms & conditions
                </Checkbox>
                <FormErrorMessage>{errors.terms && errors.terms.message}</FormErrorMessage>
              </>
            )}
          />
        </FormControl>
              <Stack spacing={10} pt={2}>
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
                    Sign up
                  </Button>
                </Tooltip>
              </Stack>
              <Stack pt={6}>
                <Text align={"center"}>
                  Ready to log in again?{" "}
                  <Link color={"blue.400"} as={routerLink} to={LOGIN}>
                    Login
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
