import React from "react";
import {
  Box,
  Heading,
  Link,
  Image,
  Text,
  Avatar,
  Flex,
  IconButton,
} from "@chakra-ui/react";
// import {useAuth} from "../../hooks/auths";
import {formatDistanceToNow} from "date-fns";
import {AiTwotoneHeart, AiOutlineHeart, AiFillDelete} from "react-icons/ai";
import {useDeletePost, useToggleLike} from "../../hooks/posts";
import Comment from "../layout/Comment";
import {Link as routerLink} from "react-router-dom";
import {useUser} from "../../hooks/user";


const SinglePost = ({post}) => {
  // const {user, isLoading: authLoading} = useAuth();
  const {id, likes, uid} = post;
  const user= 1;
  const isLiked = likes.includes(user?.id);
  const authLoading = 1;
  const {toggleLike, isLoading} = useToggleLike({
    id,
    isLiked,
    uid: user?.id,
  });
  const {deletePost, isLoading: deleteLoading} = useDeletePost(id);
  const {user: users, isLoading: userLoading} = useUser(uid);
  return (
    <>
      <Box w='100%' key={post.id}>
        <Box borderRadius='lg' overflow='hidden'>
          <Link textDecoration='none' _hover={{textDecoration: "none"}}>
            <Image
              transform='scale(1.0)'
              src={post.imageUrl}
              alt='some text'
              width='100%'
              objectFit='cover'
              height={"400px"}
              transition='0.3s ease-in-out'
              _hover={{
                transform: "scale(1.05)",
              }}
            />
          </Link>
        </Box>
        <Heading fontSize='xl' marginTop='2'>
          <Link
            textDecoration='none'
            _hover={{textDecoration: "none"}}
            as={routerLink}
            to={`/posts/${post?.id}`}
          >
            {post.title}
          </Link>
        </Heading>
        <Text as='p' fontSize='md' marginTop='2'>
          {post.desc.substring(0, 150)}...
        </Text>
        <Box mt={"10px"}>
          <Flex align={"center"}>
            <Avatar name={users?.username} size={"sm"} />
            <Text casing={"capitalize"}>
              <span style={{paddingLeft: "10px"}}>
                {formatDistanceToNow(post.date)} ago
              </span>
            </Text>
            <IconButton
              colorScheme='red'
              onClick={toggleLike}
              isLoading={authLoading || isLoading}
              size='md'
              icon={isLiked ? <AiTwotoneHeart /> : <AiOutlineHeart />}
              isRound
              variant='ghost'
            />
            <Text> {likes.length}</Text>
            {!authLoading && user?.id === uid && (
              <IconButton
                colorScheme='red'
                size='lg'
                icon={<AiFillDelete />}
                isRound
                onClick={deletePost}
                isLoading={deleteLoading}
                variant='ghost'
              />
            )}
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default SinglePost;