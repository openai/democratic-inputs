import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  Textarea,
  useColorModeValue,
  FormHelperText,
  useToast,
} from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";
import {useForm} from "react-hook-form";
import {useAddPost} from "../../hooks/posts";
// import {useAuth} from "../../hooks/auths";
export default function SimpleCard({onModalClose}) {
  const {addPost, isLoading} = useAddPost();
  // const {user, authLoading} = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm();
  const toast = useToast();

  const handleAddPost = data => {
    // addPost({
    //   uid: user.id,
    //   title: data.title,
    //   desc: data.desc,
    //   imageUrl: data.imageUrl,
    // });
    reset();
    onModalClose();
  };

  return (
    <Flex minH={"40vh"} align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"90%"} minW={"90%"} py={12}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Add new post</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack>
            <form onSubmit={handleSubmit(handleAddPost)}>
              <FormControl id='title'>
                <FormLabel>Blog Title</FormLabel>
                <Input
                  type='text'
                  {...register("title", {required: true, maxLength: 120})}
                />
                <FormHelperText>
                  Eg: The Art of Effective Communication
                </FormHelperText>
              </FormControl>
              <FormControl id='image'>
                <FormLabel> Image URL</FormLabel>
                <Input type='url' {...register("imageUrl", {required: true})} />
                <FormHelperText>
                  <Link
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "https://picsum.photos/200/300/"
                      );
                      toast({
                        title: "URL Copied",
                        status: "success",
                        isClosable: true,
                        position: "top",
                        duration: 2000,
                      });
                    }}
                  >
                    Eg: https://picsum.photos/200/300/
                  </Link>
                  <div>
                    <Text as='mark'>Copy image link by click</Text>
                  </div>
                </FormHelperText>
              </FormControl>
              <FormControl id='desc'>
                <FormLabel> Description</FormLabel>
                <Textarea
                  placeholder='I know writing can be tough, Just type "blah blah blah" to test things out!'
                  as={TextareaAutosize}
                  minRows={5}
                  resize={"none"}
                  {...register("desc", {required: true})}
                />
              </FormControl>
              <Stack spacing={10}>
                <Button
                  mt={"10px"}
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type='submit'
                  isLoading={isLoading}
                  loadingText={"Loading..."}
                >
                  Hit the Big Blue Button! POST
                </Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
