import React, {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Link,
  Image,
  Text,
  Container,
  Divider,
  Grid,
  GridItem,
  IconButton,
} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {Link as routerLink, useParams} from "react-router-dom";
import {db} from "../../lib/firebase";
import {doc, onSnapshot} from "firebase/firestore";
import {AiOutlineRollback} from "react-icons/ai";
import {ROOT} from "../../lib/routes";
import Navbar from "./Navbar";
import Comment from "./Comment";

export default function CurrentPost() {
  const {postId} = useParams();
  const [currentPost, setCurrentPost] = useState([]);
  useEffect(() => {
    onSnapshot(doc(db, "posts", postId), snapshot => {
      setCurrentPost({...snapshot.data(), id: snapshot.id});
    });
  }, []);

  console.log(currentPost);
  return (
    <>
      <Navbar />
      <motion.div layout>
        <Container maxW={"7xl"} p='12'>
          <motion.button
            whileHover={{
              scale: 1.2,
              transition: {duration: 1},
            }}
            whileTap={{scale: 0.9}}
          >
            <IconButton
              colorScheme='#319594'
              as={routerLink}
              to={ROOT}
              size='lg'
              icon={<AiOutlineRollback />}
              isRound
              variant='ghost'
            />
          </motion.button>
          <Heading as='h2'>{currentPost.title}</Heading>

          <Divider marginTop='5' />
          <Grid
            templateColumns='repeat(auto-fill, minmax(100%, 1fr))'
            gap={6}
            marginTop='5'
          >
            <GridItem>
              <Box w='100%'>
                <Box borderRadius='lg' overflow='hidden'>
                  <Link textDecoration='none' _hover={{textDecoration: "none"}}>
                    <Image
                      transform='scale(1.0)'
                      src={currentPost.imageUrl}
                      alt='blog image here'
                      width='100%'
                      height={"60vh"}
                      objectFit='cover'
                      transition='0.3s ease-in-out'
                      _hover={{
                        transform: "scale(1.05)",
                      }}
                    />
                  </Link>
                </Box>
                <Text as='p' fontSize='md' marginTop='2'>
                  {currentPost.desc}
                </Text>
              </Box>
            </GridItem>
          </Grid>
          <Comment/>
        </Container>
      </motion.div>
    </>
  );
}
