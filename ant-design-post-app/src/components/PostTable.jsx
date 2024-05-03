import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Input, Select, Spin, Table, Tag } from 'antd';
const { Search } = Input;
const { Option } = Select;


export default function PostsTable() {
    const [searchParams, setSearchParams] = useSearchParams();

    const initialLimit = searchParams.get('limit');
    const initialPage = searchParams.get('page');
    const initialSearchQuery = searchParams.get('q');
    const initialFilter = searchParams.getAll('filter');

    const [posts, setPosts] = useState([]);
    const [filteredPosts, setfilteredPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(null);
    const [tags, setTags] = useState([]);
    const [search, setSearch] = useState(initialSearchQuery || "");
    const [filter, setFilter] = useState(initialFilter || []);
    const [limit, setLimit] = useState(initialLimit || 10);
    const [page, setPage] = useState(initialPage || 1);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);


    const columns = [
        {
            title: "No.",
            dataIndex: "id",
        },
        {
            title: 'Title',
            dataIndex: 'title',
        },
        {
            title: 'Summary',
            dataIndex: 'body',
        },
        {
            title: 'Genre',
            dataIndex: 'tags',
            width: "200px",
            render: (tags) => (
                <>
                    {tags.map((tag) => {
                        let color = tag.length > 5 && tag.length <= 6 ? 'geekblue' : tag.length >= 7 && tag.length < 10 ? 'green' : 'volcano';
                        return (
                            <Tag color={color} key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Reactions',
            dataIndex: 'reactions',
            sorter: (a, b) => a.reactions - b.reactions,
        }
    ];

    const obj = {
        params: {
            limit: searchParams.get("limit"),
            skip: searchParams.get("skip"),
            q: searchParams.get("q")
        }
    }

    useEffect(() => {
        const params = {
            limit,
            skip: limit * (page - 1),
            page,
            filter
        }
        search && (params.q = search)
        setSearchParams(params)
    }, [limit, page, search, filter])

    useEffect(() => {
        fetchPosts(obj);
    }, [searchParams])

    useEffect(() => {
        categorizeTags();
    }, [])

    const fetchPosts = async (obj) => {
        try {
            setLoading(true)
            if (obj.params.q && filter.length < 1) {
                setSearchLoading(true)
                const response = await axios.get(`https://dummyjson.com/posts/search`, obj);
                setfilteredPosts([]);
                setPosts(response?.data?.posts);
                setTotalPosts(response?.data?.total)
                setSearchLoading(false)
            } else if (obj.params.q && filter.length > 0) {
                setPosts([]);
                setSearchLoading(true)
                const response = await axios.get(`https://dummyjson.com/posts/search`, obj);
                const filteredPost = response?.data?.posts.filter((post) => filter.every((tag) => post.tags.includes(tag)));
                setfilteredPosts(filteredPost);
                setTotalPosts(response?.data?.total)
                setSearchLoading(false);
            } else if (filter.length > 0) {
                setPosts([]);
                const response = await axios.get(`https://dummyjson.com/posts`, obj);
                const filteredPost = response?.data?.posts.filter((post) => filter.every((tag) => post.tags.includes(tag)));
                setfilteredPosts(filteredPost);
                setTotalPosts(response?.data?.total)
            } else if (filter.length < 1) {
                const response = await axios.get(`https://dummyjson.com/posts`, obj);
                setfilteredPosts([]);
                setPosts(response?.data?.posts);
                setTotalPosts(response?.data?.total)
            }
            setLoading(false)
        } catch (error) {
            console.log(error.message)
        }
    }

    async function categorizeTags() {
        const tags = [];
        const response = await axios.get(`https://dummyjson.com/posts`);

        response?.data?.posts.forEach((post, i) => {
            post.tags.forEach(tag => {
                if (!tags.includes(tag)) {
                    tags.push(tag)
                }
            });
        });
        setTags(tags);
    }

    const handlePage = (pagination, filters, sorter, extra) => {
        setLimit(pagination.pageSize);
        setPage(pagination.current);
    };


    return (
        <div style={{ margin: "50px", backgroundColor: "white", borderRadius: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Search placeholder="Type to search ..." size='large' allowClear enterButton loading={searchLoading} style={{ padding: "40px", paddingBottom: "0px", width: "40%" }} onChange={(e) => { setSearch(e.target.value) }} value={search} />
                <div style={{ width: "35%", marginTop: "41px", marginRight: "40px", marginBottom: "0px" }}>
                    <Select
                        mode="multiple"
                        placeholder="Select options to filter ..."
                        style={{ width: '100%' }}
                        size='large'
                        onChange={(value) => { setFilter(value) }}
                        value={filter}
                    >
                        {tags.map((option) => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                </div>


            </div>
            {loading ? <Spin size='large' style={{ paddingLeft: "690px", paddingTop: "150px", paddingBottom: "400px" }} /> : <Table
                style={{ padding: "30px" }} columns={columns} dataSource={filteredPosts.length > 0 ? filteredPosts : posts} rowKey={"id"} onChange={handlePage} pagination={{ total: totalPosts, current: page, pageSize: limit, }} showSorterTooltip={{ target: 'sorter-icon', }} />}
        </div>

    );
};
