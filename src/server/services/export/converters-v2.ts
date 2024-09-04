import { fromPairs, pick, toPairs } from 'lodash';
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
import { CustomSlugToSlug, CustomSlugs } from '../../config/constants';
import { Export, ExportOptions } from './export-v2';
import { SchemaUID } from '../../types';
const { getConfig } = require('../../utils/getConfig');

type Converter = (jsoContent: Export, options: ExportOptions) => string;

export default {
  convertToJson: withBeforeConvert(convertToJson),
};

function convertToJson(jsoContent: Export) {
  return JSON.stringify(jsoContent, null, '\t');
}

function withBeforeConvert(convertFn: Converter) {
  return async (jsoContent: Export, options: ExportOptions) => {
    const data = await beforeConvert(jsoContent, options);
    return convertFn(data, options);
  };
}

async function beforeConvert(jsoContent: Export, options: ExportOptions) {
  jsoContent = buildMediaUrl(jsoContent, options);
  jsoContent = await pickMediaAttributes(jsoContent, options);

  return jsoContent;
}

function buildMediaUrl(jsoContent: Export, options: ExportOptions) {
  let mediaSlug: SchemaUID = CustomSlugToSlug[CustomSlugs.MEDIA];
  let media = jsoContent.data[mediaSlug];

  if (!media) {
    return jsoContent;
  }

  media = fromPairs(
    toPairs(media).map(([id, medium]: [string, any]) => {
      if (isRelativeUrl(medium.url)) {
        medium.url = buildAbsoluteUrl(medium.url);
      }
      return [id, medium];
    }),
  );

  jsoContent.data[mediaSlug] = media;

  return jsoContent;
}

function isRelativeUrl(url: string) {
  return url.startsWith('/');
}

function buildAbsoluteUrl(relativeUrl: string) {
  return getConfig('serverPublicHostname') + relativeUrl;
}

async function pickMediaAttributes(jsoContent: Export, options: ExportOptions) {
  let mediaSlug: SchemaUID = CustomSlugToSlug[CustomSlugs.MEDIA];
  let media = jsoContent.data[mediaSlug];

  if (!media) {
    return jsoContent;
  }

  await processMedia(media);

  jsoContent.data[mediaSlug] = media;

  return jsoContent;
}

async function processMedia(media: Record<string, any>): Promise<Record<string, any>> {
  const pairsData: [string, any][] = await Promise.all(
    toPairs(media).map(async ([id, medium]: [string, any]): Promise<[string, any]> => {
      medium = pick(medium, ['id', 'name', 'alternativeText', 'caption', 'hash', 'ext', 'mime', 'url', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']) as any;

      const s3Client = new S3Client({
        region: getConfig('region'),
        credentials: {
          accessKeyId: getConfig('accessKeyId'),
          secretAccessKey: getConfig('secretAccessKey'),
        },
      });
      const command = new GetObjectCommand({
        Bucket: getConfig('bucket'),
        Key: medium.name,
      });

      const updatedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); //

      medium.url = updatedUrl;

      return [id, medium];
    }),
  );

  return fromPairs(pairsData);
}
