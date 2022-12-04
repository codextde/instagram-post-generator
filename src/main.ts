import { createCanvas } from '@napi-rs/canvas';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

const wrapText = function (ctx, text, x, y, maxWidth, lineHeight) {
  const words: string = text.split(' ');
  let line = '';
  let testLine = '';
  const wordArray = [];
  let totalLineHeight = 0;

  for (let n = 0; n < words.length; n++) {
    testLine += `${words[n]} `;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      wordArray.push([line, x, y]);
      y += lineHeight;
      totalLineHeight += lineHeight;
      line = `${words[n]} `;
      testLine = `${words[n]} `;
    } else {
      line += `${words[n]} `;
    }
    if (n === words.length - 1) {
      wordArray.push([line, x, y]);
    }
  }
  return [wordArray, totalLineHeight];
};

const generateMainImage = async function (data: {
  title;
  message;
  bottomText;
  number?: string | number;
  size: {
    width: number;
    height: number;
  };
  gradientColors;
}) {
  if (!data.gradientColors) {
    data.gradientColors = ['#8005fc', '#073bae'];
  }

  const canvas = createCanvas(data.size.width, data.size.height);
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, data.size.width, data.size.height, 0);
  grd.addColorStop(0, data.gradientColors[0]);
  grd.addColorStop(1, data.gradientColors[1]);
  ctx.fillStyle = grd;
  ctx.textBaseline = 'top';
  ctx.fillRect(0, 0, data.size.width, data.size.height);

  if (data.number) {
    ctx.font = 'bold 700px InterMedium';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText(data.number.toString().toUpperCase(), 0, -50);
  }

  // Bottom Text
  ctx.font = 'bold 30px InterMedium';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(data.bottomText, 50, data.size.height - 70);

  // Message
  ctx.font = 'bold 70px InterMedium';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const wrappedText: any = wrapText(
    ctx,
    data.message,
    100,
    180,
    data.size.width - 200,
    100,
  );
  wrappedText[0].forEach((item) => {
    ctx.textBaseline = 'top';
    ctx.fillText(item[0], item[1], item[2]);
  });

  ctx.font = '30px InterMedium';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(data.title.toUpperCase(), 100, 130);

  const file = `./images/${data.number}.png`;
  try {
    const canvasData = await canvas.encode('png');
    fs.writeFileSync(file, canvasData);
  } catch (e) {
    console.log(e);
    return 'Could not create png image this time.';
  }
  return 'Images have been successfully created!';
};

async function bootstrap() {
  const tips = [
    {
      title: '5 Tipps für ein erfolgreiches Unternehmen',
      message:
        'Stelle sicher, dass du klare Ziele und einen soliden Geschäftsplan hast.',
    },
    {
      title: '5 Tipps für ein erfolgreiches Unternehmen',
      message: 'Investiere in ein starkes und talentiertes Team.',
    },
    {
      title: '5 Tipps für ein erfolgreiches Unternehmen',
      message:
        'Konzentriere dich auf die Bedürfnisse deiner Kunden und stelle sicher, dass dein Produkt oder deine Dienstleistung diese Bedürfnisse erfüllt.',
    },
    {
      title: '5 Tipps für ein erfolgreiches Unternehmen',
      message:
        'Nutze Daten und Analytics, um wichtige Entscheidungen zu treffen und die Effektivität deiner Bemühungen zu messen.',
    },
    {
      title: '5 Tipps für ein erfolgreiches Unternehmen',
      message:
        'Konzentriere dich auf deine Stärken und überlasse die anderen Aufgaben an Experten in den jeweiligen Bereichen.',
    },
  ];

  for (const [index, value] of tips.entries()) {
    generateMainImage({
      title: value.title,
      message: value.message,
      number: index + 1,
      bottomText: '@businessadvisor.official',
      size: { width: 1000, height: 1000 },
      //gradientColors: ['#8005fc', '#073bae'],
      gradientColors: ['#132b42', '#0069ad'],
    });
  }
  /*generateMainImage({
    title: '5 Tipps für ein erfolgreiches Unternehmen',
    message:
      'Stelle sicher, dass du klare Ziele und einen soliden Geschäftsplan hast.',
    number: '1',
    bottomText: '@businessadvisor.official',
    size: { width: 1000, height: 1000 },
    gradientColors: ['#8005fc', '#073bae'],
  });*/
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
