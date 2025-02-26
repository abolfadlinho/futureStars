import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import FirebaseApi from "@/firebase/endpoints";
import { Post } from "@/constants/Types";

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await FirebaseApi.getPosts();
        setPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (date: string) => {
    const postDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      postDate.getDate() === today.getDate() &&
      postDate.getMonth() === today.getMonth() &&
      postDate.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      postDate.getDate() === yesterday.getDate() &&
      postDate.getMonth() === yesterday.getMonth() &&
      postDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return postDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondaryColor} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Feed</Text>
      </View>
      <FlatList
        style={styles.body}
        data={posts}
        keyExtractor={(item) => item.postId}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={styles.postTitle}>{item.title}</Text>
            </View>
            <Text style={styles.postAuthor}> ~ {item.author}</Text>
            <Text style={styles.postText}>
              {item.text.length > 100 && !item.expanded ? (
                <>
                  {item.text.substring(0, 88)}...
                  <Text
                    style={styles.seeMoreText}
                    onPress={() => {
                      const updatedPosts = posts.map((post) =>
                        post.postId === item.postId
                          ? { ...post, expanded: !post.expanded }
                          : post
                      );
                      setPosts(updatedPosts);
                    }}
                  >
                    {" See More"}
                  </Text>
                </>
              ) : (
                item.text
              )}
            </Text>
            <Text style={styles.postDate}>{formatDate(item.date)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts available.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primaryColor,
    alignItems: "center",
  },
  body: {
    backgroundColor: Colors.whiteColor,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    color: Colors.whiteColor,
    fontWeight: "bold",
  },
  postContainer: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryColor,
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 16,
    color: Colors.greyText,
    marginBottom: 12,
  },
  postDate: {
    fontSize: 14,
    color: Colors.greyText,
    textAlign: "right",
  },
  postText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  seeMoreText: {
    color: Colors.primaryColor,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.whiteColor,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.primaryColor,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.greyText,
  },
});

export default Feed;
