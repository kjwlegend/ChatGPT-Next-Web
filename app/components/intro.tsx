import React from "react";
import { Card, Carousel, Layout, Row, Col, Collapse } from "antd";
import type { CollapseProps } from "antd";
import styles from "./intro.module.scss";

const { Content } = Layout;

const featureContent = [
  {
    // title: '我们的特点',
    // subtitle: '由专业提示词工程师持续微调的智能助手',
    // description: '我们的小光 AI 智能助手经过由专业提示词工程师持续微调的训练，具备以下特点：',
    background: "carousel-1.png",
  },
  // Add more feature content objects if needed
  {
    // title: '我们的特点22',
    // subtitle: '由专业提示词工程师持续微调的智能助手',
    // description: '我们的小光 AI 智能助手经过由专业提示词工程师持续微调的训练，具备以下特点：',
    background: "carousel-2.png",
  },
];

const whyChooseUsContent = [
  {
    title: "板块二：为什么选择我们",
    blocks: [
      {
        image: "image-url-left-1",
        title: "智能互动的新境界",
        content:
          "相比传统聊天机器人，小光 AI 智能助手能够提供更加智能、准确和连贯的回答，让用户体验到全新的智能互动。",
      },
      {
        image: "image-url-right-1",
        title: "个性化回答",
        content:
          "通过提示词工程，小光 AI 智能助手能够根据用户的意图和需求，提供个性化、有针对性的回答，满足用户的特定需求。",
      },
      {
        image: "image-url-left-2",
        title: "灵活自如的对话体验",
        content:
          "小光 AI 智能助手经过专业调教，能够在对话中更加灵活自如，与用户进行自然流畅的交流。",
      },
      {
        image: "image-url-right-2",
        title: "持续学习和优化",
        content:
          "我们的团队持续改进和优化小光 AI 智能助手，以保证它始终处于最新、最先进的状态。",
      },
      {
        image: "image-url-left-3",
        title: "支持多种语言",
        content:
          "小光 AI 智能助手不仅支持英语，还支持多种其他语言，使更多用户能够享受到智能助手的便利。",
      },
      {
        image: "image-url-right-3",
        title: "快速响应和高效解决问题",
        content:
          "小光 AI 智能助手能够快速响应用户的问题，并提供高效的解决方案，帮助用户节省时间和精力。",
      },
    ],
  },
  // Add more whyChooseUs content objects if needed
];

const differentFromOthersContent = [
  {
    title: "板块三：我们与其他平台的不同",
    cards: [
      {
        title: "示例卡片1",
        content: "这是示例卡片1的内容。",
      },
      {
        title: "示例卡片2",
        content: "这是示例卡片2的内容。",
      },
      // Add more cards if needed
    ],
  },
  // Add more differentFromOthers content objects if needed
];

const CollapseContent: CollapseProps["items"] = [
  {
    key: "1",
    label: "1：我的产品有哪些特点和优势?",
    children:
      "答案：我们的产品具有以下特点和优势：\n\n强大的性能和高效的处理能力，能够处理大量复杂任务。\n用户友好的界面和简单易用的操作，即使是非专业人士也能轻松上手。\n具备智能学习和优化能力，随着使用时间的增加，能够不断提升性能和适应用户需求。",
  },
  {
    key: "2",
    label: "2：我如何获得产品的技术支持和帮助?",
    children:
      "答案：您可以通过以下方式获得我们的技术支持和帮助：\n\n访问我们的官方网站，查阅产品文档和常见问题解答。\n联系我们的客服团队，他们将为您解答问题并提供技术支持。\n参加我们的在线培训课程和研讨会，深入了解产品的使用和技术细节。",
  },
  {
    key: "3",
    label: "3：产品是否支持与其他系统的集成?",
    children:
      "答案：是的，我们的产品支持与其他系统的集成。我们提供丰富的API和开发工具，使您能够轻松将产品与现有系统进行无缝集成，实现数据共享和功能扩展。",
  },
  {
    key: "4",
    label: "4：产品的安全性如何保障?",
    children:
      "答案：我们高度重视产品的安全性，并采取多种措施来保障用户数据和系统的安全：\n\n所有数据传输都经过加密处理，确保数据的机密性和完整性。\n我们严格控制数据的访问权限，只有经过授权的人员才能访问敏感数据。\n定期进行安全审计和漏洞扫描，及时发现和修复潜在的安全风险。",
  },
  {
    key: "5",
    label: "5：产品是否提供免费试用期或退款政策?",
    children:
      "答案：是的，我们提供免费试用期和灵活的退款政策，以确保您对产品的满意度：\n\n您可以在试用期内免费体验产品的功能和性能。\n如果在购买后的一定时间内您对产品不满意，我们将根据退款政策为您办理退款。",
  },
  {
    key: "6",
    label: "6：您的产品背后使用的是哪种模型?",
    children:
      "答案：我们的产品背后使用的是基于深度学习的先进模型，其中包括OpenAI的GPT模型（生成式预训练模型）。这种模型具有强大的自然语言处理和理解能力，能够为用户提供准确、连贯的回答和解决方案。",
  },
  {
    key: "7",
    label: "7：产品是否支持私有化部署?",
    children:
      "答案：是的，我们的产品支持私有化部署。我们理解一些企业和组织对于数据安全和隐私的重视，因此我们提供了私有化部署选项，使您能够在自己的服务器或云环境中运行和管理产品，确保数据的完全控制和保密性。",
  },
];

const contentStyle: React.CSSProperties = {
  margin: 0,
  height: "100%",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignContent: "center",
  textAlign: "left",
  padding: "0 50px",
  minHeight: "500px",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
};

const FeatureSection: React.FC = () => {
  return (
    <div className={styles["section"]}>
      <Carousel autoplay dotPosition="bottom" easing="linear" effect="fade">
        {featureContent.map((content, index) => (
          <div key={index}>
            <div
            // style={{ ...contentStyle, backgroundImage: `url(${content.background})` }}
            >
              <img
                src={content.background}
                alt=""
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              {/* <h2>{content.title}</h2>
                            <h3>{content.subtitle}</h3>
                            <p>{content.description}</p> */}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

const WhyChooseUsSection: React.FC = () => {
  return (
    <div className={styles["section"]}>
      {whyChooseUsContent.map((content, index) => (
        <div key={index}>
          <h2>{content.title}</h2>
          <Row gutter={[16, 16]}>
            {content.blocks.map((block, blockIndex) => (
              <React.Fragment key={blockIndex}>
                {blockIndex % 2 === 0 ? (
                  <>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                      <img src={block.image} alt="Image" />
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                      <h3>{block.title}</h3>
                      <p>{block.content}</p>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                      <h3>{block.title}</h3>
                      <p>{block.content}</p>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                      <img src={block.image} alt="Image" />
                    </Col>
                  </>
                )}
              </React.Fragment>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};
const DifferentFromOthersSection: React.FC = () => {
  return (
    <div className={styles["section"]}>
      {differentFromOthersContent.map((content, index) => (
        <div key={index}>
          <h2>{content.title}</h2>
          <Row gutter={[16, 16]}>
            {content.cards.map((card, index) => (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} key={index}>
                <Card title={card.title}>
                  <p>{card.content}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

const CollapseSection: React.FC = () => {
  return (
    <div className={styles["section"]}>
      <Collapse items={CollapseContent} accordion />
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className={styles["home-page"]}>
      <Content>
        <FeatureSection />
        <WhyChooseUsSection />
        <DifferentFromOthersSection />
        <CollapseSection />
      </Content>
    </div>
  );
};

export default HomePage;
