-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: easyone
-- ------------------------------------------------------
-- Server version	5.7.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Account` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1D0C220D2123A6EE` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=50 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES (48,'elainetrace1@gmail.com','easy123elaine',0,NULL,203);
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BinaryData`
--

DROP TABLE IF EXISTS `BinaryData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BinaryData` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `contentType` varchar(255) DEFAULT NULL,
  `data` longblob,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BinaryData`
--

LOCK TABLES `BinaryData` WRITE;
/*!40000 ALTER TABLE `BinaryData` DISABLE KEYS */;
/*!40000 ALTER TABLE `BinaryData` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Lang`
--

DROP TABLE IF EXISTS `Lang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Lang` (
  `htmlId` varchar(255) NOT NULL,
  `English` varchar(255) DEFAULT NULL,
  `Spanish` varchar(255) DEFAULT 'translation not available',
  `French` varchar(255) DEFAULT NULL,
  `Danish` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`htmlId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Lang`
--

LOCK TABLES `Lang` WRITE;
/*!40000 ALTER TABLE `Lang` DISABLE KEYS */;
INSERT INTO `Lang` VALUES ('about','About: ','Sobre: ','Sur:','Om:'),('albumLoading','Loading Photos...|Photos','Cargando fotos...|Fotos','Chargement des photos|Photos','Loader billeder…|Billeder'),('callContact','Call ','Llamar ','Appeler','Ring op'),('chatWith','Chat with ','Chat con ','Écrire avec','Chat med'),('contactHeader','Call / Write / Chat','Call Escritura Chat','Appeler / Écrire / Chat ','Ring op / Skriv til / Chat'),('contactInstruction','First Letter of First Name','Primera Carta de Nombre','Première Lettre du Prénom ','Første bogstav I fornavn'),('emailHeader','Mail','Correo','Courrier','Post'),('from','From','De','De','Fra'),('fromInEnvelope','From','De','De','Fra'),('fromInLetter','From ','De ','De','Fra'),('Header','Touch the person you want to write <br>or talk to.','Prensa Nombre de la persona','Appuyez sure le Nom de la personne','Tryk personens navn'),('keepButtonContent','Keep','Tenga','Garder','Behold'),('mailNotesContent','Press mailbox for Mail','Prensa buzón para el correo','Appuyez sur le boîte aux lettres pour voir la poste','Klik på postkassen for post'),('new_emails','Checking|New','Verificar|Neuvo','Vérification|Nouveau','Tjekker|Ny'),('replyButtonContent','Reply','Contesta','Répondre','Svar'),('sendButtonContent','Send','Enviar','Envoyer','Send'),('sendFacade','Send','Enviar','Envoyer','Send'),('throwAwayButtonContent','Throw Away','Tirar','Jeter','Smid ud'),('throwAwayButtonContent2','Throw Away','Tirar','Jeter','Smid ud'),('throwawayFacade','Throw Away','Tirar','Jeter','Smid ud'),('to','To','A','Á','Til'),('toInEnvelope','To','A','Á','Til'),('toInLetter','To','A ','Á','Til'),('toInLetterFacade','To','A','Á','Til'),('touchEmailInstruction','Touch Envelope to open','Toque para abrir sobres','Touchez enveloppe pour ouvrir','Tryk på konvolutten for at åbne'),('viewPhotos1','View ','Ver fotos de ','Voir photos de ','Se'),('viewPhotos2','\'s photos',' ','','s fotos'),('writeMailContent','Write Mail','Escribir correo','Écrire une lettre','Skriv brev'),('writeMailTo','Write a MAIL to ','Escribir CORREO a ','Écrire UNE LETTRE á','Skriv BREV til');
/*!40000 ALTER TABLE `Lang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Person`
--

DROP TABLE IF EXISTS `Person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Person` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `chatID` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profilePicture_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8E488775D1478BC4` (`profilePicture_id`),
  KEY `FK8E4887752123A6EE` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=141 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Person`
--

LOCK TABLES `Person` WRITE;
/*!40000 ALTER TABLE `Person` DISABLE KEYS */;
/*!40000 ALTER TABLE `Person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Person_Person`
--

DROP TABLE IF EXISTS `Person_Person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Person_Person` (
  `person_id` bigint(20) NOT NULL,
  `contact_id` bigint(20) NOT NULL,
  PRIMARY KEY (`person_id`,`contact_id`),
  KEY `FKB9039F7F7C310DAE` (`person_id`),
  KEY `FKB9039F7F51ACCD03` (`contact_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Person_Person`
--

LOCK TABLES `Person_Person` WRITE;
/*!40000 ALTER TABLE `Person_Person` DISABLE KEYS */;
/*!40000 ALTER TABLE `Person_Person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `chatId` varchar(255) DEFAULT NULL,
  `chatPassword` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `loginType` int(11) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `userKey` varchar(255) DEFAULT NULL,
  `assistantPassword` varchar(255) DEFAULT NULL,
  `passwordRequired` bit(1) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `contactBookType` int(11) DEFAULT '1',
  `lang` char(20) DEFAULT 'ENG',
  `filter` varchar(255) DEFAULT 'none',
  `emailFunction` bit(1) DEFAULT NULL,
  `albumFunction` bit(1) DEFAULT NULL,
  `contactsFunction` bit(1) DEFAULT NULL,
  `screensaverwaitTime` varchar(255) DEFAULT NULL,
  `screensaverType` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=206 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-08-28 14:13:31
