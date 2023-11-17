import {
  Box,
  Container,
  Divider,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Text,
  Wrap,
  WrapItem,
  Link as ChakraLink,
} from "@chakra-ui/react";
import {motion, LayoutGroup} from "framer-motion";
import React from "react";
import { Link } from 'react-router-dom';
import {usePosts} from "../../hooks/posts";
import SinglePost from "../posts/SinglePost";
import {useUser} from "../../hooks/user";

export default function PostList() {
  const {posts, isLoading} = usePosts();
  console.log("postes" , posts)
  // const {user, isLoading: userLoading} = useUser();
  if (isLoading)
    return (
      <Box pos='absolute' top='50%' left='50%'>
        <Spinner size='xl' />
      </Box>
    );

  return (
    <Container maxW={"7xl"} p='12'>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <Heading as='h2' marginTop='6'>
      Community Projects
    </Heading>
    <ChakraLink as={Link} to="/submit-project" marginTop='6' marginLeft='2rem' textDecoration='none' fontSize= '4xl' color = 'black'>
        Submit-project
    </ChakraLink>
  </div>
      <Divider marginTop='5' />
      <Grid
        templateColumns='repeat(auto-fill, minmax(300px, 2fr))'
        gap={6}
        marginTop='5'
      >
        {posts.map(post => (
          <GridItem key={post.id}>
            <motion.div layout>
              <SinglePost post={post} />
            </motion.div>
          </GridItem>
        ))}
      </Grid>
    </Container>
  );
}
