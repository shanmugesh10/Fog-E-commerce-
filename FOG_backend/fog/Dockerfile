FROM eclipse-temurin:26-jdk

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw

COPY src src

RUN ./mvnw -B -DskipTests package

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "target/fog-0.0.1-SNAPSHOT.jar"]