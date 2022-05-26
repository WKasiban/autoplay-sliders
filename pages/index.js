import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import react from 'react'

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), 'posts')
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = await Promise.all(fileNames.map(async fileName => {
    const fullPath = path.join(postsDirectory, fileName)
    const id = fileName.replace(/\.md$/, '')
    const fileContents = fs.readFileSync(fullPath, 'utf-8')
    const matterResult = matter(fileContents)
    const processedContents = await remark()
      .use(html)
      .process(matterResult.content)
    const contentHtml = processedContents.toString()
    return {
      id,
      content: contentHtml,
      ...matterResult.data
    }
  }))

  return {
    props: {
      allPosts: JSON.parse(JSON.stringify(allPosts))
    }
  }
}

export default function Home({ allPosts }) {
  const [radioSelected, setRadioSelected] = react.useState(false)

  react.useEffect(() => {
    const images = document.getElementsByName('sliders')
    const timer = setTimeout(() => {
      for (let i=0; i<images.length; i++) {
        setRadioSelected(!radioSelected)
        if (images[i].checked) {
          if (i === images.length-1) {
            images[0].checked = true
          } else {
            images[i+1].checked = true
          }
          break
        }
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [radioSelected])

  return (
    <div className={styles.container}>
      <Head>
        <title>Auto play slider</title>
        <meta name="description" content="Auto play sliders" />
        <link rel="icon" href="/logo.ico" />
      </Head>

      <main className={styles.main}>
        {allPosts.map((post) => (
          <>
            <div className={styles.tabs}>
              <div className={styles.tab}>
                <input
                  type='radio'
                  id={post.id}
                  name='sliders'
                  value={post.title}
                  className={styles.radioTab}
                  defaultChecked
                />
                <label htmlFor={post.id}
                  key={post.id} 
                  className={styles.label}>
                    &#x25CF;
                </label>

                  <div className={styles.contentContainer}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={500}
                      height={650}
                      className={styles.imgContainer}
                    />
                    <h1 className={styles.title}>{post.title}</h1>
                    <h2>{post.by}</h2>
                    <div dangerouslySetInnerHTML={{ __html: post.content }} className={styles.content} />
                </div>

              </div>
            </div>
          </>
        ))}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://wkasiban.github.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/wkasiban.png" alt="Wkasiban Logo" width={50} height={50} />
          </span>
        </a>
      </footer>
    </div>
  )
}
