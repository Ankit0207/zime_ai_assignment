import { Content, Header } from "antd/es/layout/layout";
import PostsTable from "../components/PostTable";
import { Layout } from "antd";

export default function Home() {
    return <>
    <Layout>
        <Header style={{backgroundColor:'#3a3f47',display:"flex",alignItems:"center"}}>
            <h1 style={{color:"#f3f3f3"}}>Zime.Ai</h1>
        </Header>
        <Content>
            <PostsTable />
        </Content>
    </Layout>
        
    </>
}